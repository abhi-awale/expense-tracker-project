const {DataTypes} = require('sequelize');
const db = require('../config/db.config');

const User = db.define('User',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
    },
    firstName : {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName : {
        type: DataTypes.STRING,
        allowNull : false
    },
    email : {
        type: DataTypes.STRING,
        allowNull: false,
        unique : true
    },
    password : {
        type : DataTypes.STRING,
        allowNull: false
    },
    dob : {
        type: DataTypes.DATE,
        allowNull : true
    },
    profile_photo : {
        type: DataTypes.TEXT,
        allowNull : true
    },
    emailVerified : {
        type : DataTypes.BOOLEAN,
        defaultValue: false
    },
    isActive : {
        type : DataTypes.BOOLEAN,
        defaultValue: true
    },
    lastLoginAt : {
        type: DataTypes.DATE,
        allowNull : true
    }
}, {
    tableName:"users",
    paranoid : true,
    timestamps : true
});

module.exports = User;