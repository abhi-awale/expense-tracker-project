const express = require('express');
const path = require('path');
const publicRoutes = require('./route/publicRoutes');
const privateRoutes = require('./route/privateRoutes');

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));

app.use(express.json());

app.use('/', publicRoutes);
app.use('/', privateRoutes);

module.exports = app;