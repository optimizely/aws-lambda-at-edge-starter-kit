const https = require('https');

/**
 * generateRandomUserId - Generates a random user ID.
 * 
 * Disclaimer: 
 * It is recommnded to replace this user ID generator with your own method for production purposes. 
 * Feel free to use this function at your own discretion.
 * 
 * @returns string
 */
export function generateRandomUserId() {
  console.log('[OPTIMIZELY] Generating random user id...');
  var lut = [];
  for (var i = 0; i < 256; i++) {
    lut[i] = (i < 16 ? '0' : '') + i.toString(16);
  }
  var d0 = (Math.random() * 0xffffffff) | 0;
  var d1 = (Math.random() * 0xffffffff) | 0;
  var uuid =
    lut[d0 & 0xff] +
    lut[(d0 >> 8) & 0xff] +
    '-' +
    lut[(d0 >> 16) & 0xff] +
    lut[(d0 >> 24) & 0xff] +
    '-' +
    lut[d1 & 0xff] +
    lut[(d1 >> 8) & 0xff] +
    '-' +
    lut[((d1 >> 16) & 0x0f) | 0x40] +
    lut[(d1 >> 24) & 0xff];
  console.log('[OPTIMIZELY] Generated User ID: ' + uuid);
  return uuid;
}

/**
 * getDatafileRequest - Retrieves the datafile from the Optimizely CDN and returns as a JSON object.
 * 
 * Note: If the datafile exists in the cache, it will be returned from the cache instead.
 * 
 * @param string datafilePath - CDN path to datafile based on SDK Key.
 * @returns Promise
 */
async function getDatafileRequest(datafilePath) {
  console.log('[OPTIMIZELY] Retrieving datafile: ' + datafilePath);
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'cdn.optimizely.com',
      port: 443,
      path: datafilePath,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = https.get(options, (res) => {
      res.setEncoding('utf8');
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        try {
          resolve(JSON.parse(responseBody));
        } catch (err) {
          reject(new Error(err));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

// const DATAFILE_TTL = 3600000; // 1 Hour - TODO: Change as needed.
const DATAFILE_TTL = 60000; // 1 Minute - TODO: Change as needed.
let _datafile = null; // Cache the datafile across Lambda@Edge Invocations.
let _datafileLastFetchedTime = 0; // Note last time the datafile was fetched.

/**
 * getDatafile - Retrieves the datafile from the Optimizely CDN.
 * 
 * Note: This starter kit uses 
 * 
 * @param string sdkKey
 * @returns datafile JSON object
 */
export async function getDatafile(sdkKey) {
  console.log('[OPTIMIZELY] Getting datafile...');
  try {
    console.log(
      `[OPTIMIZELY] Checking if datafile is stale. Datafile Truthy: ${!!_datafile}. Current Time: ${Date.now()}. Last Fetched: ${_datafileLastFetchedTime}. TTL: ${DATAFILE_TTL}`
    );

    // If the datafile is not cached in-memory, or the cache is stale, fetch the datafile.
    if (!_datafile) {
      console.log(
        '[OPTIMIZELY] Cached datafile is stale, fetching new datafile...'
      );

      _datafile = await getDatafileRequest(`/datafiles/${sdkKey}.json`);

      console.log(
        '[OPTIMIZELY] Datafile response: ' + JSON.stringify(_datafile)
      );

      // In-memory cache reset mechanism.
      setTimeout(() => {
        _datafile = null;
      }, DATAFILE_TTL);

      _datafileLastFetchedTime = Date.now();
    }

    console.log(
      '[OPTIMIZELY] Datafile Last Fetched Time: ' +
      new Date(_datafileLastFetchedTime).toLocaleTimeString()
    );

    console.log(
      '[OPTIMIZELY] Returning datafile: ' + JSON.stringify(_datafile)
    );

    return _datafile;
  } catch (error) {
    console.error(
      `[OPTIMIZELY] Error getting datafile: ${error}. Try checking your SDK key.`
    );
    return null;
  }
}

/**
 * dispatchEvent - Dispatches a log event to a log server.
 * Note: If a server URL is not defined, the event is dispatched to the Optimizely LogX server by default.
 * @param object payload
 * @returns request status
 */
export function dispatchEvent({ url, params }) {
  console.log(`[OPTIMIZELY] Posting event: ${url} with params ${JSON.stringify(params)}`);

  const options = {
    host: url || 'https://logx.optimizely.com/v1/events',
    port: 443,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const postRequest = https.request(options)

  postRequest.on('error', (e) => {
    console.error(`[OPTIMIZELY] Error with dispatching event to logger. Exception: ${e}`)
  })

  postRequest.end(null, null, () => {
    console.log(
      '[OPTIMIZELY] Fire and forget event posted to Optimizely Logging API'
    );
  })
}
