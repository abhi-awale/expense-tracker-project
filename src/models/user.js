const bcrypt = require('bcryptjs');
const { DataTypes, Model } = require('sequelize');

class User extends Model {
  async verifyPassword(password) {
    return bcrypt.compare(password, this.passwordHash);
  }

  async setPassword(password) {
    this.passwordHash = await bcrypt.hash(password, 12);
  }
}

module.exports = (sequelize) => {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(120),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      resetPasswordToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      resetPasswordExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      isPremium: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      premiumPlan: {
        type: DataTypes.STRING(40),
        allowNull: true,
      },
      premiumActivatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
      hooks: {
        beforeCreate: async (user) => {
          user.passwordHash = await bcrypt.hash(user.passwordHash, 12);
        },
        beforeUpdate: async (user) => {
          if (user.changed('passwordHash')) {
            user.passwordHash = await bcrypt.hash(user.passwordHash, 12);
          }
        },
      },
    }
  );

  return User;
};
