const app = require('./app');
const { sequelize, seedDefaultCategories } = require('./models');
const env = require('./config/env');

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await seedDefaultCategories();

    app.listen(env.port, () => {
      console.log(`Expense tracker running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

start();
