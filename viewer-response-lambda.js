/**
 * Create a new Lambda@Edge function with this file and associate it with
 * the "Viewer Response" trigger of your CloudFront Distribution.
 *
 * This will capture the generated userId cookie and return it to the client.
 */

const COOKIE_NAME_OPTIMIZELY_USER_ID = 'optimizely_user_id';

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

const setCookie = function (response, cookie) {
  console.log(`Setting cookie ${cookie}`);
  response.headers['set-cookie'] = response.headers['set-cookie'] || [];
  response.headers['set-cookie'] = [{ key: 'Set-Cookie', value: cookie }];
};

exports.handler = (event, _context, callback) => {
  const request = event.Records[0].cf.request;
  const headers = request.headers;
  const response = event.Records[0].cf.response;

  const userId = getCookie(headers, COOKIE_NAME_OPTIMIZELY_USER_ID);
  if (userId != null) {
    setCookie(response, `${COOKIE_NAME_OPTIMIZELY_USER_ID}=${userId}`);
    callback(null, response);
    return;
  }

  console.log(`[optimizely]: ${COOKIE_NAME_OPTIMIZELY_USER_ID} cookie found.`);
  callback(null, response);
};
