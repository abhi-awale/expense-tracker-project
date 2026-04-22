const sequelize = require('../config/database');
const initUser = require('./user');
const initCategory = require('./category');
const initExpense = require('./expense');
const initPaymentTransaction = require('./payment-transaction');

const User = initUser(sequelize);
const Category = initCategory(sequelize);
const Expense = initExpense(sequelize);
const PaymentTransaction = initPaymentTransaction(sequelize);

User.hasMany(Category, { foreignKey: 'userId', onDelete: 'CASCADE' });
Category.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Expense, { foreignKey: 'userId', onDelete: 'CASCADE' });
Expense.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(PaymentTransaction, { foreignKey: 'userId', onDelete: 'CASCADE' });
PaymentTransaction.belongsTo(User, { foreignKey: 'userId' });

Category.hasMany(Expense, { foreignKey: 'categoryId' });
Expense.belongsTo(Category, { foreignKey: 'categoryId' });

const defaultCategories = [
  { name: 'Food', description: 'Dining, groceries, and snacks', isDefault: true },
  { name: 'Transport', description: 'Travel, cab, fuel, and transit', isDefault: true },
  { name: 'Bills', description: 'Utilities, rent, and recurring payments', isDefault: true },
  { name: 'Health', description: 'Medicine, doctor visits, and wellness', isDefault: true },
  { name: 'Shopping', description: 'Personal and household purchases', isDefault: true },
  { name: 'Entertainment', description: 'Movies, subscriptions, and leisure', isDefault: true },
];

const seedDefaultCategories = async () => {
  await Promise.all(
    defaultCategories.map((category) =>
      Category.findOrCreate({
        where: { name: category.name, userId: null },
        defaults: category,
      })
    )
  );
};

module.exports = {
  sequelize,
  User,
  Category,
  Expense,
  PaymentTransaction,
  seedDefaultCategories,
};
