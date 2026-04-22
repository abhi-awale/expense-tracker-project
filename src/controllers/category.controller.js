const { Op } = require('sequelize');
const { Category, Expense } = require('../models');
const { listCategoriesForUser } = require('../services/category.service');

const list = async (req, res) => {
  const categories = await listCategoriesForUser(req.user.id);
  res.render('categories/index', {
    title: 'Categories',
    categories,
  });
};

const create = async (req, res) => {
  if (!req.user.isPremium) {
    req.flash('error', 'Custom categories are a premium feature. Upgrade your account to unlock them.');
    req.flash('oldInput', req.body);
    return res.redirect('/categories');
  }

  const existingCategory = await Category.findOne({
    where: {
      name: req.body.name,
      [Op.or]: [{ userId: req.user.id }, { userId: null }],
    },
  });

  if (existingCategory) {
    req.flash('error', 'That category already exists.');
    req.flash('oldInput', req.body);
    return res.redirect('/categories');
  }

  await Category.create({
    name: req.body.name,
    description: req.body.description || null,
    userId: req.user.id,
    isDefault: false,
  });

  req.flash('success', 'Category created successfully.');
  return res.redirect('/categories');
};

const remove = async (req, res) => {
  const category = await Category.findOne({
    where: {
      id: req.params.id,
      userId: req.user.id,
      isDefault: false,
    },
  });

  if (!category) {
    return res.status(404).json({ message: 'Category not found.' });
  }

  const linkedExpenses = await Expense.count({
    where: {
      categoryId: category.id,
      userId: req.user.id,
    },
  });

  if (linkedExpenses > 0) {
    return res.status(409).json({
      message: 'This category is linked to existing expenses and cannot be deleted yet.',
    });
  }

  await category.destroy();
  return res.json({ message: 'Category deleted successfully.' });
};

module.exports = {
  list,
  create,
  remove,
};
