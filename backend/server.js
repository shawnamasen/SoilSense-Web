const http = require('http');
const { port, firebaseWebApiKey } = require('./config/env');
const { applyCors } = require('./http/cors');
const { sendJson } = require('./http/respond');
const { routeRequest } = require('./router');

const server = http.createServer(async (req, res) => {
  try {
    if (!applyCors(req, res)) return;
    await routeRequest(req, res);
  } catch (error) {
    // Details remain server-side; only fixed, user-safe messages are returned.
    console.error('SoilSense API request failed (details withheld from HTTP response).');
    const status = Number(error?.statusCode);
    const safeStatus = [400, 401, 403, 404, 405, 429, 503].includes(status) ? status : 500;
    const messages = {
      400: 'Invalid request.',
      401: 'Please sign in to continue.',
      403: 'You do not have permission to perform this action.',
      404: 'The requested item was not found.',
      405: 'This request is not supported.',
      429: 'Too many requests. Please try again later.',
      503: 'This service is temporarily unavailable.',
      500: 'Unable to complete the request. Please try again later.',
    };
    sendJson(res, safeStatus, { success: false, error: messages[safeStatus] });
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log('==========================================');
  console.log('  SoilSense Admin API');
  console.log('==========================================');
  console.log(`API: http://localhost:${port}`);
  console.log(`Firebase config found: ${firebaseWebApiKey ? 'Yes' : 'No'}`);
  console.log('No backend npm install is required.');
  console.log('');
});
