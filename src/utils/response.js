const httpCode = require('../utils/statusCodes');

function success(res, message, statusCode = httpCode.OK_200, data = null, cookies=[]) {

  cookies.forEach(({ name, value, options }) => {
    res.cookie(name, value, options);
  });

  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

function error(res, message, statusCode = httpCode.INTERNAL_ERROR_500, errors = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
}

function paginated(res, message, data, pagination, statusCode = httpCode.OK_200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination
  });
}

module.exports = {
    success,
    error,
    paginated
}