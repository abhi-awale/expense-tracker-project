module.exports = {
    port : process.env.PORT || 8000,
    appUrl : process.env.APP_URL || 'http://localhost',
    db : {
        name : process.env.DB_NAME,
        host : process.env.DB_HOST,
        port : process.env.DB_PORT,
        user : process.env.DB_USER,
        password : process.env.DB_PASSWORD
    },
    jwt : {
        accessTokenSecret : process.env.ACCESS_TOKEN_SECRET,
        refreshTokenSecret : process.env.REFRESH_TOKEN_SECRET,
        accessTokenExpiry : process.env.ACCESS_TOKEN_EXPIRES || "15m",
        refreshTokenExpiry : process.env.REFRESH_TOKEN_EXPIRES || "7d",
    },
    resendApiKey : process.env.RESEND_API_KEY
}