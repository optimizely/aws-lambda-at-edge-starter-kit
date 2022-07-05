/**
 * Create a new Lambda@Edge function with this file and associate it with
 * the "Viewer Response" trigger of your CloudFront Distribution.
 *
 * This will capture the generated userId cookie and return it to the client.
 */

import { getCookie, setHeaderCookie } from './cookies';

const COOKIE_NAME_OPTIMIZELY_USER_ID = 'OPTIMIZELY_USER_ID';

export function handler(event, _context, callback) {
  try {
    let request = null;
    try {
      request = event.Records[0].cf.request;
    } catch (error) {
      console.log(
        '[OPTIMIZELY] WARNING: Unable to get request object from event. This may be because the event is not a CloudFront event.'
      );
    }

    let headers = {};
    try {
      headers = request.headers;
    } catch (error) {
      console.log(
        '[OPTIMIZELY] WARNING: Unable to get headers object from request object. This may be because the event is not a CloudFront event.'
      );
    }

    let response = null;
    try {
      request = event.Records[0].cf.response;
    } catch (error) {
      console.log(
        '[OPTIMIZELY] WARNING: Unable to get response object from event. This may be because the event is not a CloudFront event.'
      );
    }

    const userId = getCookie(headers, COOKIE_NAME_OPTIMIZELY_USER_ID);

    if (userId != null) {
      response.headers = setHeaderCookie(
        headers,
        `${COOKIE_NAME_OPTIMIZELY_USER_ID}=${userId}`
      );
      callback(null, response);
      return;
    }

    console.log(
      `[OPTIMIZELY]: ${COOKIE_NAME_OPTIMIZELY_USER_ID} cookie found.`
    );

    // Add any other parameters you'd like to carry over here.

    callback(null, response);
  } catch (error) {
    console.log(`[OPTIMIZELY]: Error generating viewer response: ${error}`);
  }
}
