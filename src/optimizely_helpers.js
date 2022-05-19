const https = require('https');
const keepAliveAgent = new https.Agent({ keepAlive: true });

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
      agent: keepAliveAgent,
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
      agent: keepAliveAgent,
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
    req.end();
  });
}

/**
 * getDatafile - Retrieves the datafile from the Optimizely CDN.
 * @param string sdkKey
 * @returns datafile JSON object
 */
export async function getDatafile(sdkKey) {
  let datafile = '';

  const datafileResponse = await getDatafileRequest(
    `/datafiles/${sdkKey}.json`
  );

  if (datafileResponse.ok) {
    datafile = await datafileResponse.json();
  }

  return datafile;
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
