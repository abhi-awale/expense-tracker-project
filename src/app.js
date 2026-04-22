const path = require('path');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const compression = require('compression');
const hpp = require('hpp');
const morgan = require('morgan');
const methodOverride = require('method-override');
const env = require('./config/env');
const sanitize = require('./middleware/sanitize');
const { ensureCsrfToken, verifyCsrfToken } = require('./middleware/csrf');
const flash = require('./middleware/flash');
const authLoader = require('./middleware/auth-loader');
const locals = require('./middleware/locals');
const routes = require('./routes');

const app = express();
app.disable('x-powered-by');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://cdn.jsdelivr.net', 'https://sdk.cashfree.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'", 'https://cdn.jsdelivr.net', 'https://sdk.cashfree.com'],
        frameSrc: ["'self'", 'https://sdk.cashfree.com', 'https://sandbox.cashfree.com', 'https://cashfree.com'],
        fontSrc: ["'self'", 'https://cdn.jsdelivr.net'],
        objectSrc: ["'none'"],
        formAction: ["'self'", 'https://sandbox.cashfree.com', 'https://cashfree.com'],
        upgradeInsecureRequests: [],
      },
    },
  })
);
app.use(compression());
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(hpp());
app.use(sanitize);
app.use(ensureCsrfToken);
app.use(verifyCsrfToken);
app.use(methodOverride('_method'));
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(expressLayouts);
app.use(flash());
app.use(authLoader);
app.use(locals);
app.use(routes);

app.use((req, res) => {
  res.status(404).render('partials/error-state', {
    layout: 'layouts/main',
    title: 'Page not found',
    message: 'The page you were looking for could not be found.',
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  if (req.xhr || req.headers.accept?.includes('application/json')) {
    return res.status(500).json({ message: 'Something went wrong.' });
  }

  req.flash('error', 'Something went wrong. Please try again.');
  return res.status(500).render('partials/error-state', {
    layout: 'layouts/main',
    title: 'Server error',
    message: error.message || 'An unexpected error occurred.',
  });
});

app.locals.appName = 'ExpensePilot';
app.locals.env = env;

module.exports = app;
