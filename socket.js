const socketIo = require('socket.io');
let Room = require('./schemas/room');
let Chat = require('./schemas/chat');
let passportSocketIo = require("passport.socketio");

module.exports = (server, app, sessionStore, cookieParser) => {
  const io = socketIo(server, { path: '/socket.io' });
  app.set('io', io);
  //결론적으로 socket.request 에서 .user로 passport엣서 사용하는 세션을 사용하게해준다
  io.use(passportSocketIo.authorize({
    cookieParser: cookieParser,       // the same middleware you registrer in express
    key: 'express.sid',       // the name of the cookie where express/connect stores its session_id
    secret: 'asadlfkj!@#!@#dfgasdg',    // the session_secret to parse the cookie
    store: sessionStore,        // we NEED to use a sessionstore. no memorystore please
    success: onAuthorizeSuccess,  // *optional* callback on success - read more below
    fail: onAuthorizeFail,     // *optional* callback on fail/error - read more below
  }));

  const nameSpaceChat = io.of('/chat');
  const nameSpaceDraw = io.of('/game');
  const nameSpaceRtc = io.of('/rtc');


  nameSpaceChat.on('connection', async (socket) => {
    const req = socket.request;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    //socket에서 꺼낸 request에서는 아래와 같이 접근해야 세션정보꺼냄

    const myName = socket.request.user.name;
    console.log("chat space 신규 접속", ip, socket.id, myName);
    const splitUrl = req.headers.referer.split('/');
    const roomId = splitUrl[splitUrl.length - 1];
    socket.join(roomId);
    let chats = await Chat.find({});
    nameSpaceChat.to(roomId).emit("newJoin", myName, chats);

    socket.on('chat', function (id, message) {
      console.log('chat', id, message);
      const chat = new Chat({
        room: roomId,
        user: id,
        chat: message,
      })
      console.log('chat', chat);
      chat.save().catch(error => {
        console.log(error);
      });
      nameSpaceChat.to(roomId).emit('chat', id, message);
    })


    socket.on('disconnect', () => {
      console.log('client out', ip, socket.id);
      socket.leave(roomId);
    });

    socket.on('error', (error) => {
      console.error(error);
    })

  })

  nameSpaceDraw.on('connection', (socket) => {

    const req = socket.request;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const myName = socket.request.user.name;
    console.log("draw space 신규 접속", ip, socket.id, myName);
    const splitUrl = req.headers.referer.split('/');
    const roomId = splitUrl[splitUrl.length - 1];
    socket.join(roomId);

    socket.on('sendDraw', data => {
      console.log('sendDraw', data, roomId);
      //나를 제외한 룸의 에밋
      socket.broadcast.to(roomId).emit("receiveDraw", data);
      //나를 포함한 룸의 에밋
      // nameSpaceDraw.to(roomId).emit("receiveDraw",data);
    });

    socket.on('clearCanvas', () => {
      console.log('clear Canvas');
      //나를 제외한 룸의 에밋
      socket.broadcast.to(roomId).emit("clearCanvas");
    });

    socket.on('setColor', (data) => {
      console.log('Set Canvas Color' + data);
      //나를 제외한 룸의 에밋
      socket.broadcast.to(roomId).emit("setColor", data);
    });

    socket.on('disconnect', () => {
      console.log('client out', ip, socket.id);
      socket.leave(roomId);
    });

    socket.on('error', (error) => {
      console.error(error);
    });

  })


  nameSpaceRtc.on('connection', (socket) => {

    const req = socket.request;
    const myName = socket.request.user.name;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log("rtc space 신규 접속", ip, socket.id, myName);

    const splitUrl = req.headers.referer.split('/');
    const roomId = splitUrl[splitUrl.length - 1];
    socket.join(roomId);


    socket.on('peer-open', (userId) => {
      //socket.join(roomId); 요기서 roomId는 emit에서 오는 파라미터엿으나 삭제시킴
      console.log('peer-open 소켓을 통해 아이디 전달중 ' + userId);
      socket.to(roomId).broadcast.emit('peer-connected', userId);

      socket.on('disconnect', () => {
        console.log('RTC socket is Disconnected (socketId) ' + socket.id)
        console.log('RTC Peer is Disconnected (peerId) ' + userId)
        socket.to(roomId).broadcast.emit('socket-disconnected', userId);
        socket.leave(roomId);
      });

      socket.on('test', () => {
        console.log('RTC testsetsetsetestsetset');
      });
    });
  });




  function onAuthorizeSuccess(data, accept) {
    console.log('successful connection to socket.io');
    // The accept-callback still allows us to decide whether to
    // accept the connection or not.
    accept(null, true);
    // OR
    // If you use socket.io@1.X the callback looks different
    accept();
  }

  function onAuthorizeFail(data, message, error, accept) {
    if (error)
      throw new Error(message);
    console.log('failed connection to socket.io:', message);
    // We use this callback to log all of our failed connections.
    accept(null, false);
    // OR
    // If you use socket.io@1.X the callback looks different
    // If you don't want to accept the connection
    if (error)
      accept(new Error(message));
    // this error will be sent to the user as a special error-package
    // see: http://socket.io/docs/client-api/#socket > error-object
  }

  return io;
}