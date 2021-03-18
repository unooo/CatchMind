const mongoose = require('mongoose');

const { MONGO_ID, MONGO_PASSWORD, NODE_ENV } = process.env;
//const MONGO_URL = `mongodb://unoo:1234@localhost:27017/admin`;
const MONGO_URL = `mongodb://${MONGO_ID}:${MONGO_PASSWORD}@localhost:27017/CatchMind`;
//console.log(MONGO_URL);
module.exports = () => {
  const connect = () => {
  
    if (NODE_ENV !== 'production') {
      mongoose.set('debug', true);
    }
    mongoose.connect(MONGO_URL, {
      dbName: 'CatchMind',
      useNewUrlParser:true, // current URL string parser is deprecated 오류 해결
      useUnifiedTopology: true,
    }, (error) => {
      if (error) {
        console.log('Mongo DB Connection Fail', error);
      } else {
        console.log('Mongo DB Connection Success');
      }
    });
  };
  connect();

  mongoose.connection.on('error', (error) => {
    console.error('몽고디비 연결 에러', error);
  });
  mongoose.connection.on('disconnected', () => {
    console.log(MONGO_URL);
    console.error('몽고디비 연결이 끊겼습니다. 연결을 재시도합니다.');
    connect();
  });

  require('../schemas/chat');
  require('../schemas/room');
  require('../schemas/user');
};