const app = require('./src/app');
const {port} = require('./src/config/env.config');
const db = require('./src/config/db.config');

db.sync()
    .then((result) => {
        app.listen(port, () => {
            console.log(`Server started at port ${port}`);
        });
    })
    .catch((err) => {
        console.log('Error : ' , err);
    });