var express = require('express');
var invoiceRoute = require('./invoice');

var app = express();

app.use('/invoice', invoiceRoute);

module.exports = app;