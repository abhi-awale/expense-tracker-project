const { listCategoriesForUser } = require('../services/category.service');
const { getReportInsights } = require('../services/report.service');
const { buildReportPdf, buildReportExcel } = require('../services/report-export.service');

const showReports = async (req, res) => {
  const categories = await listCategoriesForUser(req.user.id);
  res.render('reports/index', {
    title: 'Reports',
    categories,
    premiumPrice: require('../config/env').premiumPrice,
  });
};

const getInsights = async (req, res) => {
  const insights = await getReportInsights({
    userId: req.user.id,
    month: req.query.month,
    categoryId: req.query.categoryId || undefined,
    startDate: req.query.startDate || undefined,
    endDate: req.query.endDate || undefined,
  });

  return res.json(insights);
};

const exportPdf = async (req, res) => {
  const categories = await listCategoriesForUser(req.user.id);
  const insights = await getReportInsights({
    userId: req.user.id,
    month: req.query.month,
    categoryId: req.query.categoryId || undefined,
    startDate: req.query.startDate || undefined,
    endDate: req.query.endDate || undefined,
  });
  const categoryLabel = categories.find((category) => String(category.id) === String(req.query.categoryId))?.name;
  const pdfBuffer = await buildReportPdf({
    insights,
    filters: {
      month: req.query.month,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      categoryLabel,
    },
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="expense-report.pdf"');
  return res.send(pdfBuffer);
};

const exportExcel = async (req, res) => {
  const categories = await listCategoriesForUser(req.user.id);
  const insights = await getReportInsights({
    userId: req.user.id,
    month: req.query.month,
    categoryId: req.query.categoryId || undefined,
    startDate: req.query.startDate || undefined,
    endDate: req.query.endDate || undefined,
  });
  const categoryLabel = categories.find((category) => String(category.id) === String(req.query.categoryId))?.name;
  const excelBuffer = buildReportExcel({
    insights,
    filters: {
      month: req.query.month,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      categoryLabel,
    },
  });

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', 'attachment; filename="expense-report.xlsx"');
  return res.send(excelBuffer);
};

module.exports = {
  showReports,
  getInsights,
  exportPdf,
  exportExcel,
};
