const express = require('express');
const path = require('path');

const cookieParser = require('cookie-parser');
const cors = require('cors'); 

const publicRoutes = require('./route/publicRoutes');
const privateRoutes = require('./route/privateRoutes');
const authRoutes = require('./route/authRoutes');

require('./models');

const app = express();

app.use(cors());

app.use(express.static(path.join(__dirname, "public")));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));

app.use(express.json());
app.use(cookieParser());

app.use('/', publicRoutes);
app.use('/', privateRoutes);

app.use('/api/auth/', authRoutes);

module.exports = app;