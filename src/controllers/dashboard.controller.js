const { getDashboardSummary } = require('../services/report.service');
const { listCategoriesForUser } = require('../services/category.service');

const showDashboard = async (req, res) => {
  const [summary, categories] = await Promise.all([
    getDashboardSummary(req.user.id),
    listCategoriesForUser(req.user.id),
  ]);

  res.render('dashboard/index', {
    title: 'Dashboard',
    summary,
    categories,
  });
};

module.exports = {
  showDashboard,
};
