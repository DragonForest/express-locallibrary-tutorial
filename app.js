var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sassMiddleware = require('node-sass-middleware');

var indexRouter = require(path.join(__dirname, 'routes/index'));
var usersRouter = require(path.join(__dirname, 'routes/users'));
var catalogRouter = require(path.join(__dirname, 'routes/catalog'));

var app = express();
var mongoose = require('mongoose');
var mongoDB = 'mongodb+srv://ross_jon:p1ssw0rd@cluster0-r92qc.mongodb.net/local_library?retryWrites=true';
//mongodb+srv://ross_jon:<password>@cluster0-r92qc.mongodb.net/test?retryWrites=true
mongoose.connect(mongoDB, {useNewUrlParser: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console,"MongoDB Connection Error"));
app.set('view engine','pug');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter);

module.exports = app;
