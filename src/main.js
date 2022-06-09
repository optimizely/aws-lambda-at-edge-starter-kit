import {
  createInstance,
  enums as OptimizelyEnums,
} from '@optimizely/optimizely-sdk/dist/optimizely.lite.es';

import {
  dispatchEvent,
  generateRandomUserId,
  getDatafile,
} from './optimizely_helpers';

const COOKIE_NAME_OPTIMIZELY_USER_ID = 'optimizely_user_id';
const AWS_LAMBDA_AT_EDGE_CLIENT_ENGINE = 'javascript-sdk/aws-lambda-at-edge';
const OPTIMIZELY_SDK_KEY = 'Fz4H42ij5tSrayYJX8xWd'; // TODO: Replace with your SDK Key.

// getCookie - Get the target cookie key value from a headers object.
function getCookie(headers, cookieKey) {
  if (headers.cookie) {
    for (let cookieHeader of headers.cookie) {
      const cookies = cookieHeader.value.split(';');
      for (let cookie of cookies) {
        const [key, val] = cookie.split('=');
        if (key === cookieKey) {
          return val;
        }
      }
    }
  }
  return null;
}

/**
 * === LAMBDA FUNCTION STARTING POINT ===
 * Handler function is called when Lambda function is invoked.
 * 1. User ID: Get the user ID from the cookie if it exists - otherwise generate a new user ID.
 * 2. Datafile: Get the datafile from the cache if it exists - otherwise populate with Optimizely CDN.
 * 3. Initialize Optimizely: Creates an instance of the Optimizely SDK using the Datafile.
 * 4. Experimentation Logic: Get a specific experiment result for this particular User ID.
 * 5. Result: Return the result to the caller via appending cookies to the callback function.
 */
exports.handler = async (event, _context, callback) => {
  const request = event.Records[0].cf.request;
  const headers = request.headers;

  try {
    // 1. User ID: Get the user ID from the cookie if it exists - otherwise generate a new user ID.
    let userId = getCookie(headers, COOKIE_NAME_OPTIMIZELY_USER_ID);

    if (!userId) {
      userId = generateRandomUserId();
      headers.cookie = headers.cookie || [];
      headers.cookie.push({
        key: 'Set-Cookie',
        value: `${COOKIE_NAME_OPTIMIZELY_USER_ID}=${userId}`,
      });
    }

    // 2. Datafile: Get the datafile from the cache if it exists - otherwise populate with Optimizely CDN.
    const datafile = await getDatafile(OPTIMIZELY_SDK_KEY);
    console.log(`[optimizely] Datafile: ${datafile}`);

    // 3. Initialize Optimizely: Creates an instance of the Optimizely SDK using the Datafile.
    const optimizelyClient = createInstance({
      datafile,
      logLevel: OptimizelyEnums.LOG_LEVEL.ERROR,
      clientEnginer: AWS_LAMBDA_AT_EDGE_CLIENT_ENGINE,
      /**
       * You can add other Optimizely SDK initialization options here, such as a custom event dispatcher
       * for sending impression events to Optimizely LogX.
       *
       * Note: The event dispatcher below is a sample implementation of fire-and-forget event dispatching
       * in Lambda, however if your needs are more complex, you can implement your own event dispatcher
       * and integrate with Step Functions, SQS, or other services.
       */
      dispatchEvent: dispatchEvent,
    });

    // 4. Experimentation Logic: Get a specific experiment result for this particular User ID.
    const optimizelyUserContext = optimizelyClient.createUserContext(userId, {
      // You can set additional user-specific attributes here.
    });

    /**
     * Optional: Log the datafile revision number to console.
     * const optimizelyConfig = optimizelyClient.getOptimizelyConfig();
     * console.log(`[optimizely] Datafile Revision: ${optimizelyConfig.revision}`);
     */

    // === For a Single Flag ===  //
    const decision = optimizelyUserContext.decide('home-screen-flag'); // TODO: Replace with your flag name.
    console.log(
      `[optimizely] The Flag ${decision.flagKey} was ${
        decision.enabled ? 'Enabled' : 'Not Enabled'
      } for the user ${decision.userContext.getUserId()}`
    );

    // === For All Flags ===  //
    // const allDecisions = optimizelyUserContext.decideAll();
    // Object.entries(allDecisions).forEach(([flagKey, decision]) => {
    //   console.log(
    //     `[optimizely] The Flag ${decision.flagKey} was ${
    //       decision.enabled ? 'Enabled' : 'Not Enabled'
    //     } for the user ${decision.userContext.getUserId()}`
    //   );
    // });

    /**
     * From here, you can add your own logic to handle the viewer request event.
     * For example:
     * - Returning a decision response as a header to the viewer request event.
     * - Setting a cookie to the viewer request event.
     * - etc.
     */

    // 5. Result: Return the result to the caller via appending headers or cookies to the callback function.

    // 5a. Cookies
    // headers.cookie = headers.cookie || [];
    // headers.cookie.push({
    //   key: 'Set-Cookie',
    //   value: `home-screen-flag-decision=${decision.enabled}`,
    // });

    // 5b. Headers
    headers['home-screen-flag-decision'] = [
      {
        key: 'home-screen-flag-decision',
        value: decision.enabled,
      },
    ];

    callback(null, request);
  } catch (error) {
    console.error(`[optimizely] Error running Lambda Function: ${error}`);
    callback(null, request);
  }
};
