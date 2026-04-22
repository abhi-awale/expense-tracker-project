const { sequelize, seedDefaultCategories } = require('../src/models');

const run = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await seedDefaultCategories();
    console.log('Default categories seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed default categories:', error);
    process.exit(1);
  }
};

run();
