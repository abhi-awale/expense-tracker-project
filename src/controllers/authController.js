const crypto = require('crypto');
const { User } = require('../models');
const httpCode = require('../utils/statusCodes');
const response = require('../utils/response');
const { registerSchema, loginSchema } = require('../validators/auth.validate');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const {appUrl, port} = require('../config/env.config');

const { sendVerificationEmail } = require('../utils/email');

async function create(req, res) {
    try {
        const { error, value } = registerSchema.validate(req.body, {
            stripUnknown: true
        });

        if (error) {
            return response.error(res, error.message, httpCode.UNPROCESSABLE_ENTITY_422)
        }

        const user = await User.findOne({ where: { email: value.email } });

        if (user) {
            return response.error(res, 'User already exists!', httpCode.UNPROCESSABLE_ENTITY_422)
        }

        const hashedPassword = await hashPassword(value.password);
        const token = generateVerificationToken();

        const newUser = await User.create({
            firstName: value.firstName,
            lastName: value.lastName,
            email: value.email,
            password: hashedPassword,
            emailVerificationToken: token,
            emailVerificationExpires: Date.now() + 1000 * 60
        });

        const verificationLink = `${appUrl}:${port}/api/auth/verify-email?token=${token}`;

        sendVerificationEmail(newUser, verificationLink);

        return response.success(res, 'User created successfully!', httpCode.RESOURCE_CREATED_201);

    } catch (err) {

        return response.error(res, 'User creation failed!', httpCode.INTERNAL_ERROR_500);
    }

}

async function login(req, res) {
    try {
        const { error, value } = loginSchema.validate(req.body, {
            stripUnknown: true
        });

        if (error) {
            return response.error(res, error.message, httpCode.UNPROCESSABLE_ENTITY_422)
        }

        const user = await User.findOne({ where: { email: value.email } });

        if (!user) {
            return response.error(res, 'Invalid credentials!', httpCode.BAD_REQUEST_400);
        }

        const isPasswordValid = await comparePassword(value.password, user.password);

        if (!isPasswordValid) {
            return response.error(res, 'Invalid credentials!', httpCode.UNAUTHORIZED_401);
        }

        const payload = {
            id: user.id,
            email: user.email
        }

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        await user.update({ refreshToken });

        const cookies = [
            {
                name: 'accessToken',
                value: accessToken,
                options: { httpOnly: true, sameSite: 'Lax' }
            },
            {
                name: "refreshToken",
                value: refreshToken,
                options: { httpOnly: true, sameSite: 'Lax' }
            }
        ];

        return response.success(res, 'User logged in successfully!', httpCode.OK_200, null, cookies);

    } catch (err) {
        return response.error(res, 'User login failed!', httpCode.INTERNAL_ERROR_500);
    }
}

async function verifyEmail(req, res) {
  try {
    const { token } = req.query;

    if (!token) {
      return response.view(res, 'templates/verify-email-failed', {success:false, message: 'Invalid User/Token'})
    }

    const user = await User.findOne({
      where: {
        emailVerificationToken: token
      }
    });

    if (!user) {
      return response.view(res, 'templates/verify-email-failed', {success:false, message: 'Invalid User!', id:null})
    }

    if (user.emailVerificationExpires < Date.now()) {
      return response.view(res, 'templates/verify-email-failed', {success:false, message: 'Token expired!', id : user.id})
    }

    await user.update({
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null
    });


    return response.view(res, 'templates/verify-email-success', {success:true, message: 'Your email is verified successfully'})

  } catch (err) {
    return response.view(res, 'templates/verify-email-failed', {success:false, message: 'Your email verification failed'})
  }
}

async function resendVerifyEmail(req, res) {
    try{
        const {id} = req.params;

        const user = await User.findByPk(id);

        if (!user) {
            return response.error(res, 'Invalid credentials!', httpCode.BAD_REQUEST_400);
        }

        const token = generateVerificationToken();

        await user.update({
            emailVerificationToken : token,
            emailVerificationExpires : Date.now() + 1000 * 60
        });

        const verificationLink = `${appUrl}:${port}/api/auth/verify-email?token=${token}`;

        sendVerificationEmail(user, verificationLink);

        return response.success(res, 'Verification link sent, check your email!', httpCode.OK_200);
    }catch(err) {
        console.log(err);
        return response.error(res, 'Failed to send email', httpCode.INTERNAL_ERROR_500);
    }
}

function generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
}

module.exports = {
    create,
    login,
    verifyEmail,
    resendVerifyEmail
}