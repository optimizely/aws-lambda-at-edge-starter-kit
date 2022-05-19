/**
 * getCookie - Get the target cookie key value from a headers object.
 * @param object headers
 * @param string cookieKey
 * @returns cookie value or null
 */
export function getCookie(headers, cookieKey) {
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
 * setCookie - Set the target cookie key value in a headers object.
 * @param object response
 * @param string cookie
 */
export function setCookie(response, cookie) {
  console.log(`Setting cookie ${cookie}`);
  response.headers['set-cookie'] = response.headers['set-cookie'] || [];
  response.headers['set-cookie'] = [
    {
      key: 'Set-Cookie',
      value: cookie,
    },
  ];
}
