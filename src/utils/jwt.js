const Jwt = require("jsonwebtoken");
const {jwt} = require('../config/env.config');

const ACCESS_TOKEN_SECRET = jwt.accessTokenSecret;
const REFRESH_TOKEN_SECRET = jwt.refreshTokenSecret;

const ACCESS_TOKEN_EXPIRES = jwt.accessTokenExpiry;
const REFRESH_TOKEN_EXPIRES = jwt.refreshTokenExpiry;

function generateAccessToken(payload) {
  return Jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES
  });
}

function generateRefreshToken(payload) {
  return Jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES
  });
}

function verifyAccessToken(token) {
  try {
    return Jwt.verify(token, ACCESS_TOKEN_SECRET);
  } catch (error) {
    return null;
  }
}

function verifyRefreshToken(token) {
  try {
    return Jwt.verify(token, REFRESH_TOKEN_SECRET);
  } catch (error) {
    return null;
  }
}

function decodeToken(token) {
  return Jwt.decode(token);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken
};