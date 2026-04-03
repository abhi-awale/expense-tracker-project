const { User } = require('../models');
const httpCode = require('../utils/statusCodes');
const response = require('../utils/response');

async function create(req, res) {
    const { firstName, lastName, email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email} });

        if (user) {
            return response.error(res, 'User already exists!', httpCode.UNPROCESSABLE_ENTITY_422)
        }

        await User.create({
            firstName, lastName, email, password
        });

        return response.success(res, 'User created successfully!', httpCode.RESOURCE_CREATED_201);

    } catch (err) {

        return response.error(res, 'User creation failed!', httpCode.INTERNAL_ERROR_500);
    }

}

module.exports = {
    create
}