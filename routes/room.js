var express = require('express');
var router = express.Router();

let Chat = require('../schemas/chat');
let Room = require('../schemas/room');
const wrap = require('../lib/wrap');
module.exports = function (io) {

    router.get('/:roomId', wrap(async function (request, response) {
        if(!request.isAuthenticated()){
            response.redirect('/?ret=Please_Login');
        }// 클라이언트단에서 막아두긴했으나 일단처리해둠

        const myId = request.user.id;//request.headers['x-forwarded-for'] || request.connection.remoteAddress;
        console.log('myId',myId);
        let rId = request.params.roomId;
        let chats = await Chat.find({ room: rId });
        /*
        await  Room.findByIdAndUpdate(rId,{ $inc: { nowUser: 1 }});
        */

        response.render('conference.ejs', { rId, chats, myId });

    }));

    router.post('/', wrap(async function (request, response) {

        if (!request.isAuthenticated()) {
            response.send({
                status: false,
                reason: "please Login",
            });
            return;
        }

        await new Room({
            title: request.body,
            owner: request.user.name,
            ownerId:request.user._id,
            
        }).save();

        //index.js에서 중복코드발생

        let rooms = await Room.find({});
        let roomNowUserLst = [];
        for (let i = 0; i < rooms.length; i++) {
            //room별 접속자수 확인
            let roomInfo = io.of('/chat').adapter.rooms[rooms[i]._id + ""];
            roomInfo ? roomNowUserLst[i] = roomInfo.length : roomNowUserLst[i] = 0;
        }
        response.send({
            status: true,
            rooms, roomNowUserLst
        });
    }))

    router.delete('/', wrap(async function (request, response) {

        if (!request.isAuthenticated()) {
            response.send({
                status: false,
                reason: "please Login",
            });
            return;
        }

        let room = await Room.findOne({ _id: request.body });
        if (room.ownerId != request.user._id) {
           
            response.send({
                status: false,
                reason: "not Owner",
            });
            return;
        }

        await Room.deleteOne({ _id: request.body });

        let rooms = await Room.find({});
        let roomNowUserLst = [];
        for (let i = 0; i < rooms.length; i++) {
            //room별 접속자수 확인
            let roomInfo = io.of('/chat').adapter.rooms[rooms[i]._id + ""];
            roomInfo ? roomNowUserLst[i] = roomInfo.length : roomNowUserLst[i] = 0;
        }
        response.send({
            status: true,
            rooms, roomNowUserLst
        });
    }))

    return router;

}
