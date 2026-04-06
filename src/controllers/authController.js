const { User } = require('../models');
const httpCode = require('../utils/statusCodes');
const response = require('../utils/response');
const { registerSchema, loginSchema } = require('../validators/auth.validate');
const { hashPassword, comparePassword } = require('../utils/hash');
const {generateAccessToken, generateRefreshToken} = require('../utils/jwt');

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

        await User.create({
            firstName: value.firstName,
            lastName: value.lastName,
            email: value.email,
            password: hashedPassword
        });

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
            id : user.id,
            email : user.email
        }

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload); 

        await user.update({ refreshToken });

        const cookies = [
            {
                name : 'accessToken',
                value : accessToken,
                options : { httpOnly : true, sameSite : 'Lax' }
            },
            {
                name : "refreshToken", 
                value : refreshToken,
                options :{ httpOnly : true, sameSite : 'Lax' }
            }
        ];

        return response.success(res, 'User logged in successfully!', httpCode.OK_200, null, cookies);

    } catch (err) {
        return response.error(res, 'User login failed!', httpCode.INTERNAL_ERROR_500);
    }
}

module.exports = {
    create,
    login
}