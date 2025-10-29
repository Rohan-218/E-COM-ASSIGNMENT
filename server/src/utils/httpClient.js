import fetch from 'node-fetch';

const nodeFetch = (...args) => fetch(...args);

export const HttpStatus = {
  Ok: 200,
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
};

export const HttpMethods = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

export const apiCall = (url, method, body, headers) => {
  const httpMethod = method || HttpMethods.GET;
  let apiBody;
  if (body) {
    apiBody = JSON.stringify(body);
  }
  return new Promise((resolve, reject) => {
    nodeFetch(url, {
      body: apiBody,
      headers,
      method: httpMethod,
    })
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
