/**
 * getCookie - Get the target cookie key value from a headers object.
 * @param object headers
 * @param string cookieKey
 * @returns cookie value or null
 */
export function getCookie(headers, cookieKey) {
  console.log(
    `[OPTIMIZELY] Searching ${JSON.stringify(headers)} for cookie ${cookieKey}`
  );
  try {
    console.log(`[OPTIMIZELY] Getting cookie: ${cookieKey}`);
    if (headers && headers.cookie) {
      for (let cookieHeader of headers.cookie) {
        const cookies = cookieHeader.value.split(';');
        for (let cookie of cookies) {
          const [rawKey, rawVal] = cookie.split('=');
          const key = rawKey.trim();
          const val = rawVal.trim();
          if (key === cookieKey) {
            console.log(
              `[OPTIMIZELY] Cookie "${cookieKey}" found with value of: ${val}`
            );
            return val;
          }
        }
      }
    }
    console.log(`[OPTIMIZELY] Cookie "${cookieKey}" not found.`);
    return null;
  } catch (error) {
    console.log('[OPTIMIZELY] Error getting cookie from headers:', error);
    return null;
  }
}

/**
 * setHeaderCookie - Set the target cookie key value in a headers object.
 * @param object response
 * @param string cookie
 */
export function setHeaderCookie(headers, cookie) {
  console.log(`[OPTIMIZELY] Setting cookie: ${cookie}`);
  return {
    ...headers,
    'Set-Cookie': `${cookie}; Path=/; Secure; HttpOnly`,
    'set-cookie': [
      {
        key: 'Set-Cookie',
        value: cookie,
      },
    ],
  };
}
