const showLandingPage = (req, res) => {
  res.render('home/index', {
    title: 'Smarter Expense Tracking',
  });
};

module.exports = {
  showLandingPage,
};
