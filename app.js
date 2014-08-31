var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var debug = require('debug')('nchat');

// var routes = require('./routes/index');
// var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(__dirname+'/'));
app.use(express.static(__dirname+'/public'));

//app.use('/', routes);
//app.use('/users', users);

var users = {};

app.get('/', function(req, res){
    if(req.cookies.user == null){
        res.redirect('/signin');
    }else{
        res.sendfile('views/index.html');
    }
});

app.get('/signin', function(req, res){
    console.log("req for signin");
    res.sendfile('views/signin.html');
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
        // res.render('error', {
        //     message: err.message,
        //     error: err
        // });
        res.send(err.message);
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    // res.render('error', {
    //     message: err.message,
    //     error: {}
    // });
    res.send(err.message);
});

app.set('port', process.env.PORT || 80);

var server = app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});

var io = require('socket.io').listen(server);
io.sockets.on('connection', function(socket){
    socket.on('online', function (data) {
      //将上线的用户名存储为 socket 对象的属性，以区分每个 socket 对象，方便后面使用
        socket.name = data.user;
      //users 对象中不存在该用户名则插入该用户名
        if (!users[data.user]) {
            users[data.user] = data.user;
         }
      //向所有用户广播该用户上线信息
        io.sockets.emit('online', {users: users, user: data.user});
    });

    socket.on('say', function(data){
        if(data.to == 'all'){
            socket.broadcast.emit('say', data);
        }else{
            var clients = io.sockets.clients();

            clients.forEach(function(client){
                if(client.name == data.to){
                    socket.emit('say', data);
                }
            });
        }
    });
});
 //module.exports = app;
