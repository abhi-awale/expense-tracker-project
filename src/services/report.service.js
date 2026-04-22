const { Op, fn, col, literal } = require('sequelize');
const { Expense, Category } = require('../models');
const { monthBounds } = require('../utils/formatters');

const buildExpenseFilters = ({ userId, month, categoryId, search, startDate, endDate }) => {
  const where = {
    userId,
  };

  if (month) {
    Object.assign(where, monthBounds(month));
  }

  if (startDate || endDate) {
    where.expenseDate = {
      ...(where.expenseDate || {}),
      ...(startDate ? { [Op.gte]: startDate } : {}),
      ...(endDate ? { [Op.lte]: endDate } : {}),
    };
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (search) {
    where.title = { [Op.like]: `%${search}%` };
  }

  return where;
};

const listExpensesForExport = async ({
  userId,
  month,
  categoryId,
  search,
  startDate,
  endDate,
  sortBy = 'expenseDate',
  sortOrder = 'DESC',
}) => {
  const where = buildExpenseFilters({
    userId,
    month,
    categoryId,
    search,
    startDate,
    endDate,
  });

  return Expense.findAll({
    where,
    include: [{ model: Category, attributes: ['id', 'name'] }],
    order: [[sortBy, sortOrder], ['id', 'DESC']],
  });
};

const getDashboardSummary = async (userId) => {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const where = buildExpenseFilters({ userId, month: currentMonth });

  const [monthlyTotalRaw, monthlyCount, recentExpenses, topCategories] = await Promise.all([
    Expense.sum('amount', { where }),
    Expense.count({ where }),
    Expense.findAll({
      where: { userId },
      include: [{ model: Category }],
      order: [['expenseDate', 'DESC'], ['id', 'DESC']],
      limit: 5,
    }),
    Expense.findAll({
      where,
      attributes: [
        'categoryId',
        [fn('SUM', col('amount')), 'totalAmount'],
        [fn('COUNT', col('Expense.id')), 'entries'],
      ],
      include: [{ model: Category, attributes: ['name'] }],
      group: ['categoryId', 'Category.id'],
      order: [[literal('totalAmount'), 'DESC']],
      limit: 5,
    }),
  ]);

  const monthlyTotal = Number(monthlyTotalRaw || 0);

  return {
    monthlyTotal,
    monthlyCount,
    averageExpense: monthlyCount > 0 ? monthlyTotal / monthlyCount : 0,
    recentExpenses,
    topCategories: topCategories.map((item) => ({
      name: item.Category.name,
      totalAmount: Number(item.get('totalAmount')),
      entries: Number(item.get('entries')),
    })),
  };
};

const getReportInsights = async ({ userId, month, categoryId, startDate, endDate }) => {
  const where = buildExpenseFilters({ userId, month, categoryId, startDate, endDate });

  const [totalSpentRaw, expenseCount, categoryBreakdown, dailyTrend] = await Promise.all([
    Expense.sum('amount', { where }),
    Expense.count({ where }),
    Expense.findAll({
      where,
      attributes: [
        [col('Category.name'), 'categoryName'],
        [fn('SUM', col('amount')), 'totalAmount'],
      ],
      include: [{ model: Category, attributes: [] }],
      group: ['Category.name'],
      order: [[literal('totalAmount'), 'DESC']],
    }),
    Expense.findAll({
      where,
      attributes: ['expenseDate', [fn('SUM', col('amount')), 'totalAmount']],
      group: ['expenseDate'],
      order: [['expenseDate', 'ASC']],
    }),
  ]);

  const totalSpent = Number(totalSpentRaw || 0);
  const averageSpend = expenseCount > 0 ? totalSpent / expenseCount : 0;
  const topCategory = categoryBreakdown[0]?.get('categoryName') || 'No data';

  return {
    totals: {
      totalSpent,
      expenseCount,
      averageSpend,
      topCategory,
    },
    categoryBreakdown: categoryBreakdown.map((entry) => ({
      name: entry.get('categoryName'),
      totalAmount: Number(entry.get('totalAmount')),
    })),
    dailyTrend: dailyTrend.map((entry) => ({
      date: entry.expenseDate,
      totalAmount: Number(entry.get('totalAmount')),
    })),
  };
};

module.exports = {
  buildExpenseFilters,
  getDashboardSummary,
  getReportInsights,
  listExpensesForExport,
};
