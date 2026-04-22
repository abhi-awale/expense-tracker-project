const { Op } = require('sequelize');
const { Expense, Category } = require('../models');
const { listCategoriesForUser, findOwnedCategory } = require('../services/category.service');
const { buildExpenseFilters, listExpensesForExport } = require('../services/report.service');
const { buildExpensesPdf, buildExpensesExcel } = require('../services/expense-export.service');
const { parsePositiveInt, buildPagination } = require('../utils/query');

const allowedSortFields = new Set(['expenseDate', 'amount', 'title']);
const allowedSortOrders = new Set(['ASC', 'DESC']);

const list = async (req, res) => {
  const page = parsePositiveInt(req.query.page, 1);
  const limit = parsePositiveInt(req.query.limit, 10);
  const sortBy = allowedSortFields.has(req.query.sortBy) ? req.query.sortBy : 'expenseDate';
  const sortOrder = allowedSortOrders.has((req.query.sortOrder || '').toUpperCase())
    ? req.query.sortOrder.toUpperCase()
    : 'DESC';

  const filters = {
    userId: req.user.id,
    month: req.query.month,
    categoryId: req.query.categoryId || undefined,
    search: req.query.search?.trim(),
    startDate: req.query.startDate || undefined,
    endDate: req.query.endDate || undefined,
  };

  const where = buildExpenseFilters(filters);
  const totalItems = await Expense.count({ where });
  const pagination = buildPagination({ page, limit, totalItems });

  const [expenses, categories] = await Promise.all([
    Expense.findAll({
      where,
      include: [{ model: Category, attributes: ['id', 'name'] }],
      order: [[sortBy, sortOrder], ['id', 'DESC']],
      limit: pagination.limit,
      offset: pagination.offset,
    }),
    listCategoriesForUser(req.user.id),
  ]);

  res.render('expenses/index', {
    title: 'Expenses',
    expenses,
    categories,
    filters: {
      month: req.query.month || '',
      startDate: req.query.startDate || '',
      endDate: req.query.endDate || '',
      categoryId: req.query.categoryId || '',
      search: req.query.search || '',
      sortBy,
      sortOrder,
      limit,
    },
    pagination,
  });
};

const create = async (req, res) => {
  const category = await findOwnedCategory(req.user.id, req.body.categoryId);

  if (!category) {
    req.flash('error', 'Selected category is not available.');
    return res.redirect('/expenses');
  }

  await Expense.create({
    title: req.body.title,
    amount: req.body.amount,
    expenseDate: req.body.expenseDate,
    notes: req.body.notes || null,
    categoryId: category.id,
    userId: req.user.id,
  });

  req.flash('success', 'Expense saved successfully.');
  return res.redirect('/expenses');
};

const update = async (req, res) => {
  const expense = await Expense.findOne({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
  });

  if (!expense) {
    return res.status(404).json({ message: 'Expense not found.' });
  }

  const category = await findOwnedCategory(req.user.id, req.body.categoryId);

  if (!category) {
    return res.status(422).json({ message: 'Invalid category.' });
  }

  await expense.update({
    title: req.body.title,
    amount: req.body.amount,
    expenseDate: req.body.expenseDate,
    notes: req.body.notes || null,
    categoryId: category.id,
  });

  return res.json({ message: 'Expense updated successfully.' });
};

const remove = async (req, res) => {
  const expense = await Expense.findOne({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
  });

  if (!expense) {
    return res.status(404).json({ message: 'Expense not found.' });
  }

  await expense.destroy();
  return res.json({ message: 'Expense deleted successfully.' });
};

const listJson = async (req, res) => {
  const expenses = await Expense.findAll({
    where: {
      userId: req.user.id,
      ...(req.query.q
        ? {
            title: {
              [Op.like]: `%${req.query.q}%`,
            },
          }
        : {}),
    },
    include: [{ model: Category, attributes: ['name'] }],
    order: [['expenseDate', 'DESC']],
    limit: 10,
  });

  return res.json(expenses);
};

const exportPdf = async (req, res) => {
  const categories = await listCategoriesForUser(req.user.id);
  const expenses = await listExpensesForExport({
    userId: req.user.id,
    month: req.query.month,
    categoryId: req.query.categoryId || undefined,
    search: req.query.search?.trim(),
    startDate: req.query.startDate || undefined,
    endDate: req.query.endDate || undefined,
    sortBy: allowedSortFields.has(req.query.sortBy) ? req.query.sortBy : 'expenseDate',
    sortOrder: allowedSortOrders.has((req.query.sortOrder || '').toUpperCase())
      ? req.query.sortOrder.toUpperCase()
      : 'DESC',
  });
  const categoryLabel = categories.find((category) => String(category.id) === String(req.query.categoryId))?.name;
  const pdfBuffer = await buildExpensesPdf({
    expenses,
    filters: {
      month: req.query.month,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      categoryLabel,
      search: req.query.search,
      sortBy: req.query.sortBy || 'expenseDate',
      sortOrder: req.query.sortOrder || 'DESC',
    },
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="expenses-export.pdf"');
  return res.send(pdfBuffer);
};

const exportExcel = async (req, res) => {
  const categories = await listCategoriesForUser(req.user.id);
  const expenses = await listExpensesForExport({
    userId: req.user.id,
    month: req.query.month,
    categoryId: req.query.categoryId || undefined,
    search: req.query.search?.trim(),
    startDate: req.query.startDate || undefined,
    endDate: req.query.endDate || undefined,
    sortBy: allowedSortFields.has(req.query.sortBy) ? req.query.sortBy : 'expenseDate',
    sortOrder: allowedSortOrders.has((req.query.sortOrder || '').toUpperCase())
      ? req.query.sortOrder.toUpperCase()
      : 'DESC',
  });
  const categoryLabel = categories.find((category) => String(category.id) === String(req.query.categoryId))?.name;
  const excelBuffer = buildExpensesExcel({
    expenses,
    filters: {
      month: req.query.month,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      categoryLabel,
      search: req.query.search,
      sortBy: req.query.sortBy || 'expenseDate',
      sortOrder: req.query.sortOrder || 'DESC',
    },
  });

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', 'attachment; filename="expenses-export.xlsx"');
  return res.send(excelBuffer);
};

module.exports = {
  list,
  create,
  update,
  remove,
  listJson,
  exportPdf,
  exportExcel,
};
