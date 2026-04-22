const { Op } = require('sequelize');

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

const monthBounds = (month) => {
  if (!month) {
    return {};
  }

  const start = new Date(`${month}-01T00:00:00`);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);

  return {
    expenseDate: {
      [Op.gte]: start,
      [Op.lt]: end,
    },
  };
};

module.exports = {
  formatCurrency,
  monthBounds,
};
