const { DataTypes, Model } = require('sequelize');

class Category extends Model {}

module.exports = (sequelize) => {
  Category.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(60),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(160),
        allowNull: true,
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'Category',
      indexes: [
        {
          unique: true,
          fields: ['name', 'user_id'],
        },
      ],
    }
  );

  return Category;
};
