/**
 * Create a new Lambda@Edge function with this file and associate it with
 * the "Viewer Response" trigger of your CloudFront Distribution.
 *
 * This will capture the generated userId cookie and return it to the client.
 */

const COOKIE_NAME_OPTIMIZELY_USER_ID = 'OPTIMIZELY_USER_ID';

function getCookie(headers, cookieKey) {
  try {
    console.log(`[OPTIMIZELY] Getting cookie: ${cookieKey}`);
    if (headers && headers.cookie) {
      for (let cookieHeader of headers.cookie) {
        const cookies = cookieHeader.value.split(';');
        for (let cookie of cookies) {
          const [key, val] = cookie.split('=');
          if (key === cookieKey) {
            console.log(`[OPTIMIZELY] Cookie "${cookieKey}" found with value of: ${val}`);
            return val;
          }
        }
      }
    }
    return null;
  } catch (error) {
    console.log('[OPTIMIZELY] Error getting cookie from headers:', error);
    return null;
  }
}

const setCookie = function (response, cookie) {
  console.log(`[OPTIMIZELY] Setting cookie: ${cookie}`);
  response.headers['set-cookie'] = response.headers['set-cookie'] || [];
  response.headers['set-cookie'] = [{ key: 'Set-Cookie', value: cookie }];
};

exports.handler = (event, _context, callback) => {
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
      setCookie(response, `${COOKIE_NAME_OPTIMIZELY_USER_ID}=${userId}`);
      callback(null, response);
      return;
    }

    console.log(`[OPTIMIZELY]: ${COOKIE_NAME_OPTIMIZELY_USER_ID} cookie found.`);
    callback(null, response);
  } catch (error) {
    console.log(`[OPTIMIZELY]: Error generating viewer response: ${error}`)
  }
};
