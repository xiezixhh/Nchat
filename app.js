var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var debug = require('debug')('nchat');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', routes);
app.use('/users', users);

var users = {};

app.get('/', function(req, res){
    if(req.cookies.user == null){
        res.redirect('/signin');
    }else{
        res.sendFile('views/index.html');
    }
});

app.get('/signin', function(req, res){
    res.sendFile('views/signin.html');
});

app.post('/signin', function(req, res){
    if(users[req.body.name]){
        res.redirect('/signin');
    }else{
        res.cookie("user", req.body.name, {maxAge:1000*60*60});
        res.redirect('/');
    }
});
/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});

var io = require('socket.io').listen(server);
io.sockets.on('connection', function(socket){{
    socket.name = data.user;

    if(!users[data.user]){
        users[data.user] = data.user;
    }

    io.sockets.emit('online', {users:users, user: data.user});
}});
//module.exports = app;
