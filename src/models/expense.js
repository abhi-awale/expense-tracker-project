const { DataTypes, Model } = require('sequelize');

class Expense extends Model {}

module.exports = (sequelize) => {
  Expense.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      notes: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      expenseDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Expense',
      indexes: [
        { fields: ['user_id', 'expense_date'] },
        { fields: ['category_id'] },
      ],
    }
  );

  return Expense;
};
