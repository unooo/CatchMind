const express = require('express');
const app = express();
//const server = require('http').Server(app);
let https = require('https');
fs = require('fs');
var options = {
  key: fs.readFileSync('www.unoo.kro.kr-key.pem'),
  cert: fs.readFileSync('www.unoo.kro.kr-crt.pem'),
  ca: fs.readFileSync('www.unoo.kro.kr-chain.pem'),
  requestCert: false,
  rejectUnauthorized: false,
};
const server = https.Server(options, app);
server.listen(443, function () {
  console.log('success https');
})

const { v4: uuidV4 } = require('uuid');
require('dotenv').config();
app.set('view engine', 'pug');
app.set('view engine', 'ejs');
app.use(express.static('public'));

var bodyParser = require('body-parser');
let cookieParser = require('cookie-parser')
//var helmet = require('helmet')
//app.use(helmet());

var session = require('express-session')
var compression = require('compression');
const mongoose = require('mongoose');
const connect = require('./lib/db.js');
connect();
app.use(express.static('public'));
//app.use('요청경로',express.static(원하는실제폴더의경로));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(bodyParser.text());
app.use(cookieParser())
app.use(compression());
const MongoStore = require('connect-mongo')(session);
const sessionStore = new MongoStore({ mongooseConnection: mongoose.connection });
let sessionMiddleWare = session({
  key: 'express.sid',
  secret: 'asadlfkj!@#!@#dfgasdg',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 6000000,
  }
});
app.use(sessionMiddleWare);

const io = require('./socket.js')(server, app, sessionStore, cookieParser);
var passport = require('./lib/passport')(app);
var indexRouter = require('./routes/index')(io);
var roomRouter = require('./routes/room')(io);
var authRouter = require('./routes/auth')(passport);

const ExpressPeerServer = require('peer').ExpressPeerServer;
//https://www.unoo.kro.kr/peerjs/myapp 확인용 주소가 이와같다 
const peerServer = ExpressPeerServer(server, {
  port: 443,
  path: '/myapp',
  debug: true,
  allow_discovery: false,
  secure: true,
  ssl: {
    key: fs.readFileSync('www.unoo.kro.kr-key.pem'),
    cert: fs.readFileSync('www.unoo.kro.kr-crt.pem')
  }
});

app.use('/peerjs', peerServer);
app.use('/', indexRouter);
app.use('/room', roomRouter);
app.use('/auth', authRouter);


app.use(function (req, res, next) {
  console.log(req.url);
  res.status(404).send('Sorry cant find that!');
});

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
});

peerServer.on('connection', (client) => { console.log('peerServer.on(connection)') });
peerServer.on('disconnect', (client) => {
  console.log('peerServer.on(disconnect)')
});

//server.listen(3000);