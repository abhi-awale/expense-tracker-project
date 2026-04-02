const {Sequelize} = require('sequelize');
const {db} = require('./env.config');

const connection = new Sequelize(
    db.name, db.user, db.password, {
        host: db.host,
        dialect: 'mysql',
        logging: false
    }
);

(async function(){
    try{
        await connection.authenticate();
        console.log('DB Connected successfully!');
    } catch{
        console.log('DB connection failed');
    }
})();

module.exports = connection;