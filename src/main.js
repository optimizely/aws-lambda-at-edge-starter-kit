import {
  EVENT_TYPES,
  AWS_LAMBDA_AT_EDGE_CLIENT_ENGINE,
  COOKIE_NAME_OPTIMIZELY_VISITOR_ID,
} from './constants';

import { getCookie, setCookie } from './cookies';

import {
  createInstance,
  enums as OptimizelyEnums,
} from '@optimizely/optimizely-sdk/dist/optimizely.lite.es';
import { generateRandomUserId, getDatafile } from './optimizely_helpers';

const OPTIMIZELY_SDK_KEY = 'Fz4H42ij5tSrayYJX8xWd'; // TODO: Replace with your SDK Key.

/**
 * Handler function is called when Lambda function is invoked.
 */
exports.handler = async (event, context, callback) => {
  const request = event.Records[0].cf.response;
  const response = event.Records[0].cf.response;
  const headers = request.headers;

  const eventType = event.Records[0].cf.config.eventType;

  switch (eventType) {
    case EVENT_TYPES.VIEWER_REQUEST:
      // Insert logic here specific to the viewer request event.
      break;
    case EVENT_TYPES.ORIGIN_REQUEST:
      // Insert logic here specific to the origin request event.
      break;
    case EVENT_TYPES.ORIGIN_RESPONSE:
      // Insert logic here specific to the origin response event.
      break;
    case EVENT_TYPES.VIEWER_RESPONSE:
      // Insert logic here specific to the viewer response event.
      break;
  }

  // Get the visitor ID from the cookie. If null, generate a new visitor ID.
  let userId =
    getCookie(headers, COOKIE_NAME_OPTIMIZELY_VISITOR_ID) ||
    generateRandomUserId();

  setCookie(response, `${COOKIE_NAME_OPTIMIZELY_VISITOR_ID}=${userId}`);

  const datafile = await getDatafile(OPTIMIZELY_SDK_KEY);

  if (datafile === '') {
    console.log(
      '[optimizely] Failed to fetch the datafile, please check the optimizely sdk key'
    );
    return;
  }

  const optimizelyClient = createInstance({
    datafile,
    logLevel: OptimizelyEnums.LOG_LEVEL.ERROR,
    clientEnginer: AWS_LAMBDA_AT_EDGE_CLIENT_ENGINE,
  });

  const optimizelyUserContext = optimizelyClient.createUserContext(userId, {
    /* YOUR OPTIONAL ATTRIBUTES HERE */
  });

  const optimizelyConfig = optimizelyClient.getOptimizelyConfig();
  console.log(`[optimizely] Datafile Revision: ${optimizelyConfig.revision}`);

  const decision = optimizelyUserContext.decide('home-screen-flag'); // TODO: Replace with your flag name.
  console.log(
    `[optimizely] The Flag ${decision.flagKey} was ${
      decision.enabled ? 'Enabled' : 'Not Enabled'
    } for the user ${decision.userContext.getUserId()}`
  );

  const allDecisions = optimizelyUserContext.decideAll();
  Object.entries(allDecisions).forEach(([flagKey, decision]) => {
    console.log(
      `[optimizely] The Flag ${decision.flagKey} was ${
        decision.enabled ? 'Enabled' : 'Not Enabled'
      } for the user ${decision.userContext.getUserId()}`
    );
  });

  callback(null, response);
  return;
};
