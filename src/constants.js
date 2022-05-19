/**
 * EVENT_TYPES
 * - Represents possible event types that map to parts of the Lambda @ Edge lifecycle.
 * - VIEWER_REQUEST: The viewer request event is fired when a viewer makes a request to the origin. (Routed)
 * - ORIGIN_REQUEST: The origin request event is fired when a viewer makes a request to the origin.
 * - ORIGIN_RESPONSE: The origin response event is fired when the origin responds to a viewer request.
 * - VIEWER_RESPONSE: The viewer response event is fired when the origin responds to a viewer request.
 */
export const EVENT_TYPES = {
  VIEWER_REQUEST: 'viewer_request',
  ORIGIN_REQUEST: 'origin_request',
  ORIGIN_RESPONSE: 'origin_response',
  VIEWER_RESPONSE: 'viewer_response',
};

export const COOKIE_NAME_OPTIMIZELY_VISITOR_ID = 'optimizely_visitor_id';
export const AWS_LAMBDA_AT_EDGE_CLIENT_ENGINE =
  'javascript-sdk/aws-lambda-at-edge';
