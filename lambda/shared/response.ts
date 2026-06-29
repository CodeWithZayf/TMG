const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export const ok = (body: unknown) => ({
  statusCode: 200,
  headers: CORS_HEADERS,
  body: JSON.stringify(body),
});

export const created = (body: unknown) => ({
  statusCode: 201,
  headers: CORS_HEADERS,
  body: JSON.stringify(body),
});

export const err = (statusCode: number, message: string) => ({
  statusCode,
  headers: CORS_HEADERS,
  body: JSON.stringify({ message }),
});
