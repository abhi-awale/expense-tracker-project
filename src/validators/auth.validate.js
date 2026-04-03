const joi = require('joi');

const registerSchema = joi.object({
    firstName : joi.string().trim().min(3).pattern(/^[A-Za-z]+$/).required().messages({
        'string.pattern.base' : 'First Name must contains only alphabets without spaces.'
    }),
    lastName : joi.string().trim().min(3).pattern(/^[A-Za-z]+$/).required().messages({
        'string.pattern.base' : 'Last Name must contains only alphabets without spaces.'
    }),
    email : joi.string().email().lowercase().required(),
    password : joi.string().min(6).required(),
});

module.exports = {
    registerSchema
}