const { User } = require('../models');

async function create(req, res) {
    const {firstName, lastName, email, password} = req.body;

    try {
        await User.create({
            firstName, lastName, email, password
        });

        return res.status(201).json({
            success : true,
            message : "User created successfully!"
        });
        
    } catch(err) {
        console.log(err);
        return res.status(500).json({
            success : false,
            message : "User creation failed!"
        });
    }

}

module.exports = {
    create
}