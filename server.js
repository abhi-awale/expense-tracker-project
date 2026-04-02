const app = require('./src/app');
const {PORT} = require('./src/config/env.config');

app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
});