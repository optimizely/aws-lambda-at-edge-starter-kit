const https = require('https');

/**
 * generateRandomUserId - Generate a random user ID.
 * @returns string
 */
export function generateRandomUserId() {
  console.log('Generating random user id');
  var lut = [];
  for (var i = 0; i < 256; i++) {
    lut[i] = (i < 16 ? '0' : '') + i.toString(16);
  }
  var d0 = (Math.random() * 0xffffffff) | 0;
  var d1 = (Math.random() * 0xffffffff) | 0;
  return (
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
    lut[(d1 >> 24) & 0xff]
  );
}

/**
 * getDatafileRequest - Retrieves the datafile from the Optimizely CDN and returns as a JSON object.
 * Note: If the datafile exists in the cache, it will be returned from the cache instead.
 * @param string datafilePath - CDN path to datafile based on SDK Key.
 * @returns Promise
 */
function getDatafileRequest(datafilePath) {
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

    req.write(data);
    req.end();
  });
}

const DATAFILE_TTL = 3600000; // 1 Hour - TODO: Change as needed.
let _datafile = ''; // Cache the datafile across Lambda@Edge Invocations.
let _datafileLastFetchedTime = 0; // Note last time the datafile was fetched.

/**
 * getDatafile - Retrieves the datafile from the Optimizely CDN.
 * @param string sdkKey
 * @returns datafile JSON object
 */
export async function getDatafile(sdkKey) {
  try {
    // If the datafile is not cached, or the cache is stale, fetch the datafile.
    if (_datafile && Date.now() - _datafileLastFetchedTime > DATAFILE_TTL) {
      const datafileResponse = await getDatafileRequest(
        `/datafiles/${sdkKey}.json`
      );

      if (datafileResponse.ok) {
        _datafile = await datafileResponse.json();
      }

      _datafileLastFetchedTime = Date.now();
    }

    return _datafile;
  } catch (error) {
    console.error(
      `Error getting datafile: ${error}. Try checking your SDK key.`
    );
    return null;
  }
}

/**
 * postEventRequest - Posts an event to the Optimizely Logging API.
 * @param object payload
 * @returns Promise
 */
function postEventRequest(payload) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'ew.logx.optimizely.com',
      port: 443,
      path: '/v1/events',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length,
      },
    };

    const req = https.post(options, (res) => {
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
      reject(new Error(err));
    });

    req.write(JSON.stringify(payload));
    req.end(null, null, () => {
      console.log('Fire and forget event posted to Optimizely Logging API');
      resolve(req);
    });
  });
}

/**
 * dispatchEvent - Dispatches a log event to the Optimizely LogX server.
 * @param object payload
 * @returns request status
 */
export async function dispatchEvent(payload) {
  const eventResponse = await postEventRequest(
    'https://ew.logx.optimizely.com/v1/events',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length,
      },
      body: payload,
    }
  );

  return eventResponse.status;
}
