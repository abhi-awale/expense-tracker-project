const { DataTypes, Model } = require('sequelize');

class PaymentTransaction extends Model {}

module.exports = (sequelize) => {
  PaymentTransaction.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      orderId: {
        type: DataTypes.STRING(60),
        allowNull: false,
        unique: true,
      },
      providerOrderId: {
        type: DataTypes.STRING(60),
        allowNull: true,
      },
      paymentSessionId: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      provider: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: 'cashfree',
      },
      featureKey: {
        type: DataTypes.STRING(60),
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: 'CREATED',
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING(8),
        allowNull: false,
        defaultValue: 'INR',
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      paidAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'PaymentTransaction',
      indexes: [
        { fields: ['user_id', 'feature_key'] },
        { fields: ['status'] },
      ],
    }
  );

  return PaymentTransaction;
};
