// let Room = require('../schemas/room.js');

// exports.createRooms=async (title,max,owner,password,createdAt)=>{

//     let room = new Room({
//         title,max,owner,password,createdAt,
//     });;

//     const newRoom=await room.save();
    
// }

// exports.readRooms=async ()=>{
//     let rooms=await Room.find({});
//     return rooms;
// }

// exports.deleteRooms=async(roomId)=>{
//     let ret = await Room.remove({
//        _id: roomId,
//     })
// }