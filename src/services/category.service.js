const { Op } = require('sequelize');
const { Category } = require('../models');

const listCategoriesForUser = (userId) =>
  Category.findAll({
    where: {
      [Op.or]: [{ userId }, { isDefault: true }],
    },
    order: [
      ['isDefault', 'DESC'],
      ['name', 'ASC'],
    ],
  });

const findOwnedCategory = (userId, categoryId) =>
  Category.findOne({
    where: {
      id: categoryId,
      [Op.or]: [{ userId }, { isDefault: true }],
    },
  });

module.exports = {
  listCategoriesForUser,
  findOwnedCategory,
};
