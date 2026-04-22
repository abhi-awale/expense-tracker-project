const PDFDocument = require('pdfkit');
const XLSX = require('xlsx');
const { formatCurrency } = require('../utils/formatters');

const chartPalette = ['#123458', '#D4A373', '#2F4156', '#7E8A97', '#80A1C1', '#D8B4A0'];

const labelDateRange = ({ startDate, endDate, month }) => {
  if (startDate || endDate) {
    return `${startDate || 'Beginning'} to ${endDate || 'Today'}`;
  }

  if (month) {
    return month;
  }

  return 'All time';
};

const buildWorkbookBuffer = ({ rows, sheetName = 'Export' }) => {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  sheet['!cols'] = rows[0].map((_, index) => ({ wch: index === 0 ? 24 : 18 }));
  XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

const buildPdfBuffer = (drawFn) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    drawFn(doc);
    doc.end();
  });

const drawReportPdf = (doc, { insights, filters }) => {
  const rangeLabel = labelDateRange(filters);

  doc.roundedRect(40, 40, 515, 110, 24).fill('#123458');
  doc.fillColor('#D4A373').fontSize(12).text('ExpensePilot Premium', 60, 58);
  doc.fillColor('#FFFFFF').fontSize(24).text('Expense Report', 60, 78);
  doc.fillColor('#DCE8F5').fontSize(10).text(`Period: ${rangeLabel}`, 60, 112);
  doc.fillColor('#DCE8F5').fontSize(10).text(`Category: ${filters.categoryLabel || 'All categories'}`, 250, 112);

  const statCards = [
    ['Total spent', formatCurrency(insights.totals.totalSpent)],
    ['Entries', String(insights.totals.expenseCount)],
    ['Average', formatCurrency(insights.totals.averageSpend)],
    ['Top category', insights.totals.topCategory],
  ];

  statCards.forEach((card, index) => {
    const x = 40 + index * 129;
    doc.roundedRect(x, 170, 115, 76, 16).fill('#F8FAFC');
    doc.fillColor('#6B7280').fontSize(10).text(card[0], x + 12, 188);
    doc.fillColor('#123458').fontSize(14).text(card[1], x + 12, 206, { width: 92 });
  });

  doc.roundedRect(40, 270, 250, 255, 18).fill('#FFFFFF');
  doc.fillColor('#123458').fontSize(16).text('Category breakdown', 60, 292);
  doc.fillColor('#6B7280').fontSize(9).text('Top contributors by spend', 60, 312);

  const categoryItems = insights.categoryBreakdown.slice(0, 6);
  const categoryMax = Math.max(...categoryItems.map((item) => item.totalAmount), 1);
  categoryItems.forEach((item, index) => {
    const y = 340 + index * 28;
    const width = (item.totalAmount / categoryMax) * 150;
    doc.fillColor('#2F4156').fontSize(9).text(item.name, 60, y);
    doc.roundedRect(60, y + 12, 150, 10, 5).fill('#E8EEF5');
    doc.roundedRect(60, y + 12, width, 10, 5).fill(chartPalette[index % chartPalette.length]);
    doc.fillColor('#123458').fontSize(9).text(formatCurrency(item.totalAmount), 220, y + 9);
  });

  doc.roundedRect(305, 270, 250, 255, 18).fill('#FFFFFF');
  doc.fillColor('#123458').fontSize(16).text('Daily trend', 325, 292);
  doc.fillColor('#6B7280').fontSize(9).text('Totals by day', 325, 312);
  doc.strokeColor('#CBD5E1').lineWidth(1);
  doc.moveTo(340, 480).lineTo(525, 480).stroke();
  doc.moveTo(340, 340).lineTo(340, 480).stroke();

  const trendItems = insights.dailyTrend.slice(0, 10);
  const trendMax = Math.max(...trendItems.map((item) => item.totalAmount), 1);
  const step = trendItems.length > 1 ? 170 / (trendItems.length - 1) : 0;
  doc.strokeColor('#123458').lineWidth(2);
  trendItems.forEach((item, index) => {
    const x = 340 + index * step;
    const y = 480 - (item.totalAmount / trendMax) * 120;
    if (index === 0) {
      doc.moveTo(x, y);
    } else {
      doc.lineTo(x, y);
    }
  });
  if (trendItems.length > 1) {
    doc.stroke();
  }
  trendItems.forEach((item, index) => {
    const x = 340 + index * step;
    const y = 480 - (item.totalAmount / trendMax) * 120;
    doc.circle(x, y, 2.5).fill('#D4A373');
    doc.fillColor('#6B7280').fontSize(7).text(item.date.slice(5), x - 8, 487, { width: 18, align: 'center' });
  });

  doc.roundedRect(40, 545, 515, 220, 18).fill('#FFFFFF');
  doc.fillColor('#123458').fontSize(16).text('Executive summary', 60, 567);
  doc
    .fillColor('#2F4156')
    .fontSize(10)
    .text(
      `The report covers ${rangeLabel}. Total recorded spend is ${formatCurrency(
        insights.totals.totalSpent
      )} across ${insights.totals.expenseCount} entries, with an average transaction value of ${formatCurrency(
        insights.totals.averageSpend
      )}.`,
      60,
      595,
      { width: 475, lineGap: 4 }
    )
    .text(
      `The highest-spend category in this period is ${insights.totals.topCategory}. Use the category breakdown and daily trend to identify concentration patterns and timing peaks for budgeting decisions.`,
      60,
      640,
      { width: 475, lineGap: 4 }
    );

  doc.fillColor('#6B7280').fontSize(9).text('Generated by ExpensePilot backend export service.', 40, 790);
};

const buildReportPdf = (payload) => buildPdfBuffer((doc) => drawReportPdf(doc, payload));

const buildReportExcel = ({ insights, filters }) => {
  const rangeLabel = labelDateRange(filters);
  const rows = [
    ['ExpensePilot Report Export'],
    ['Date Range', rangeLabel],
    ['Category', filters.categoryLabel || 'All categories'],
    [],
    ['Summary'],
    ['Total Spent', insights.totals.totalSpent],
    ['Expense Count', insights.totals.expenseCount],
    ['Average Spend', insights.totals.averageSpend],
    ['Top Category', insights.totals.topCategory],
    [],
    ['Category Breakdown'],
    ['Category', 'Total Amount'],
    ...insights.categoryBreakdown.map((item) => [item.name, item.totalAmount]),
    [],
    ['Daily Trend'],
    ['Date', 'Total Amount'],
    ...insights.dailyTrend.map((item) => [item.date, item.totalAmount]),
  ];

  return buildWorkbookBuffer({
    rows,
    sheetName: 'Report',
  });
};

module.exports = {
  buildReportPdf,
  buildReportExcel,
  labelDateRange,
};
