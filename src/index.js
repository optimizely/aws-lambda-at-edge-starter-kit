import {
  createInstance,
  enums as OptimizelyEnums,
} from '@optimizely/optimizely-sdk/dist/optimizely.lite.es';

import * as cookie from 'cookie';

import {
  dispatchEvent,
  generateRandomUserId,
  getDatafile,
} from './optimizely_helpers';

const COOKIE_NAME_OPTIMIZELY_USER_ID = 'OPTIMIZELY_USER_ID';
const AWS_LAMBDA_AT_EDGE_CLIENT_ENGINE = 'javascript-sdk/aws-lambda-at-edge';
const OPTIMIZELY_SDK_KEY = '<YOUR_SDK_KEY_HERE>'; // TODO: Replace with your SDK Key.

/**
 * === LAMBDA FUNCTION STARTING POINT ===
 * Handler function is called when Lambda function is invoked.
 * 1. User ID: Get the user ID from the cookie if it exists - otherwise generate a new user ID.
 * 2. Datafile: Get the datafile from the cache if it exists - otherwise populate with datafile fetched from Optimizely CDN.
 * 3. Initialize Optimizely: Creates an instance of the Optimizely SDK using the Datafile.
 * 4. Make Decisions: Get a specific decision result for this particular User ID.
 * 5. Result: Return the result to the caller via appending cookies to the callback function.
 */
exports.handler = async (event, _context, callback) => {
  console.log('[OPTIMIZELY] Initializing function...');

  let request = null;
  try {
    request = event.Records[0].cf.request;
  } catch (error) {
    console.log(
      '[OPTIMIZELY] WARNING: Unable to get request object from event. This may be because the event is not a CloudFront event.'
    );
  }

  let headers = {};
  let cookies = {};
  try {
    headers = request.headers;
    cookies = headers.cookie;
  } catch (error) {
    console.log(
      '[OPTIMIZELY] WARNING: Unable to get headers object from request object. This may be because the event is not a CloudFront event.'
    );
  }

  try {
    // 1. User ID: Get the user ID from the cookie if it exists - otherwise generate a new user ID.
    console.log('[OPTIMIZELY] Getting user ID...');
    let userId = cookies[COOKIE_NAME_OPTIMIZELY_USER_ID] || '';

    if (userId === '') {
      userId = generateRandomUserId();
      headers = {
        ...headers,
        'Set-Cookie': cookie.serialize(COOKIE_NAME_OPTIMIZELY_USER_ID, userId),
      };
    }

    console.log(`[OPTIMIZELY] Using User ID: ${userId}`);
    console.log(`[OPTIMIZELY] Using SDK Key: ${OPTIMIZELY_SDK_KEY}`);

    // 2. Datafile: Get the datafile from the cache if it exists - otherwise populate with Optimizely CDN.
    const datafile = await getDatafile(OPTIMIZELY_SDK_KEY);

    // 3. Initialize Optimizely: Creates an instance of the Optimizely SDK using the Datafile.
    const optimizelyClient = createInstance({
      datafile,
      logLevel: OptimizelyEnums.LOG_LEVEL.ERROR,
      clientEngine: AWS_LAMBDA_AT_EDGE_CLIENT_ENGINE,
      /**
       * You can add other Optimizely SDK initialization options here, such as a custom event dispatcher
       * for sending impression events to Optimizely LogX.
       */

      /**
       * Optional event dispatcher. Please uncomment the following line if you want to dispatch an impression event to optimizely logx backend.
       * When enabled, an event is dispatched asynchronously. It does not impact the response time for a particular worker but it may
       * add to the total compute time of the Lambda function and can impact AWS billing.
       *
       * The event dispatcher attached below is a sample implementation of fire-and-forget event dispatching
       * in Lambda, however if your needs are more complex, you can implement your own event dispatcher
       * and integrate with Step Functions, SQS, or other services.
       */
      // eventDispatcher: { dispatchEvent },
    });

    // 4. Experimentation Logic: Get a specific experiment result for this particular User ID.
    const optimizelyUserContext = optimizelyClient.createUserContext(userId, {
      // You can set additional user-specific attributes here.
    });

    /**
     * Optional: Log the datafile revision number to console.
     */

    try {
      const optimizelyConfig = optimizelyClient.getOptimizelyConfig();
      console.log(
        `[OPTIMIZELY] Datafile Revision: ${optimizelyConfig.revision}`
      );
    } catch (error) {
      console.error(`[OPTIMIZELY] Error getting datafile revision: ${error}`);
    }

    // === For a Single Flag ===  //
    const decision = optimizelyUserContext.decide('<YOUR_FLAG_HERE>'); // TODO: Replace with your flag name.
    console.log(
      `[OPTIMIZELY] The Flag ${decision.flagKey} was ${
        decision.enabled ? 'Enabled' : 'Not Enabled'
      } for the user ${decision.userContext.getUserId()}`
    );

    // === For All Flags ===  //
    // const allDecisions = optimizelyUserContext.decideAll();
    // Object.entries(allDecisions).forEach(([flagKey, decision]) => {
    //   console.log(
    //     `[OPTIMIZELY] The Flag ${decision.flagKey} was ${
    //       decision.enabled ? 'Enabled' : 'Not Enabled'
    //     } for the user ${decision.userContext.getUserId()}`
    //   );
    // });

    /**
     * From here, you can add your own logic to handle the viewer request event.
     * For example:
     * - Returning a decision response as a header to the viewer request event.
     * - Setting a cookie to the viewer request event.
     * - Overriding the request URI.
     * - etc.
     *
     * Below is an example of setting a cookie to the viewer request event.
     */

    // 5. Result: Return the result to the caller via appending headers or cookies to the callback function.

    // 5a. Cookies
    // headers = {
    //   ...headers,
    //   'Set-Cookie': cookie.serialize(COOKIE_NAME_OPTIMIZELY_USER_ID, userId)
    // }

    // 5b. Headers
    // headers['<YOUR_FLAG_HERE>-decision'] = [
    //   {
    //     key: '<YOUR_FLAG_HERE>-decision',
    //     value: decision.enabled,
    //   },
    // ];

    // 5c. This example returns a basic response to the caller.

    let responseBody = {
      key: '<YOUR_FLAG_HERE>-decision',
      value: `Enabled: ${decision.enabled}`,
    };

    const response = {
      body: JSON.stringify(responseBody),
      headers,
      status: '200',
      statusDescription: 'OK',
    };

    // callback(null, response); // Uncomment this when using with a CloudFront trigger.
    return response; // Used for Lambda-only testing.
  } catch (error) {
    console.error(`[OPTIMIZELY] Error running Lambda Function: ${error}`);

    const response = {
      body: 'Error: Issue running Lambda Function',
      headers,
      status: '503',
      statusDescription: 'Service Unavailable',
    };

    // callback(null, response); // Uncomment this when using with a CloudFront trigger.
    return response; // Used for Lambda-only testing.
  }
};
