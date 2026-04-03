const { User } = require('../models');
const httpCode = require('../utils/statusCodes');
const response = require('../utils/response');
const {registerSchema} = require('../validators/auth.validate');
const {hashPassword} = require('../utils/hash');

async function create(req, res) {
    try {
        const {error, value} = registerSchema.validate(req.body, {
            stripUnknown:true
        });

        if(error) {
            return response.error(res, error.message, httpCode.UNPROCESSABLE_ENTITY_422)
        }

        const user = await User.findOne({ where: { email : value.email } });

        if (user) {
            return response.error(res, 'User already exists!', httpCode.UNPROCESSABLE_ENTITY_422)
        }

        const hashedPassword = await hashPassword(value.password);

        await User.create({
            firstName : value.firstName, 
            lastName : value.lastName, 
            email : value.email, 
            password : hashedPassword
        });

        return response.success(res, 'User created successfully!', httpCode.RESOURCE_CREATED_201);

    } catch (err) {

        return response.error(res, 'User creation failed!', httpCode.INTERNAL_ERROR_500);
    }

}

module.exports = {
    create
}