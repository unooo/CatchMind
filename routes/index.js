var express = require('express');
var router = express.Router();
let Room = require('../schemas/room.js');
module.exports = function (io) {

  router.get('/', async function (request, response) {

    try {

      let rooms = await Room.find({});
      let roomNowUserLst=[];
      for(let i = 0 ; i < rooms.length ; i ++){
        //room별 접속자수 확인
          let roomInfo=io.of('/chat').adapter.rooms[rooms[i]._id+""] ;
          roomInfo?roomNowUserLst[i]=roomInfo.length:roomNowUserLst[i]=0;
      }
      let user = null;
      if (request.isAuthenticated()) {
        user = request.user;
      }
      response.render('main', { rooms, user,roomNowUserLst });

    } catch (error) {
      console.log(error);
    }
  });

  router.get('/.well-known/acme-challenge/:key',function(request,response){
    console.log('인증중',request.params.key);
    response.send(request.params.key);
  })

  return router;
}