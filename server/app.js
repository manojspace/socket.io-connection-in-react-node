const express = require('express');
const path = require('path');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const env = process.env.NODE_ENV || 'development';
const config = require('./config/config.json')[env];

const io = require("socket.io");
const http = require('http');
var helmet = require('helmet');

var app = express();
app.io = require('socket.io')();

app.use(helmet.xssFilter());
app.use(helmet.frameguard());

const sockets = require('./routes/sockets')(app, app.io);

// setting view engine as ejs with file extension .html
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

process.setMaxListeners(0);

/*app.use(favicon(path.join(__dirname, 'public/images', 'favicon.ico')));*/

app.use(bodyParser.json({
    limit: '8mb'
})); // support json encoded bodies

app.use(bodyParser.urlencoded({
    limit: '8mb',
    extended: true
})); // support encoded bodies

app.use(cookieParser());

app.use(config.baseUrl, express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
    res.header("X-powered-by", "Blood, sweat, and tears.");
    next();
});

app.use(config.baseUrl + 'api/sockets', sockets);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    console.log(err);
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
