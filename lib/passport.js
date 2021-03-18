

var db = require('../lib/db');
const bcrypt = require('bcrypt');
module.exports = function (app) {
  const User = require('../schemas/user');

  var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;
  //페스포트 인클루드하겠다
  app.use(passport.initialize());//페스포트 모듈 사용하겠다
  app.use(passport.session()); //페스포트와 세션모듈을 연결하겠다
  //중요!!!!!!!!!! 위에 두줄은 server.js에서 해도되는거다 여기에있으면오히려혼잡

  //로그인이 성공했을때 아래의 함수의 콜백함수가 불리도록 되어있다

  passport.serializeUser(function (user, done) {//로그인시 딱 한번만 호출한다.
    //로그인시 딱 한번만 호출한다.
    //로그인시 딱 한번만 호출한다.
    //아래에서  done 함수를 통해 보내준 객체를 이  콜백함수에 user로 주입해주기로 약속되어있음
    console.log('serializeuser', user);

    done(null, user.id); // 여기서 돈 한게 deserializeuser의 id로 간다. 원리는 이 라인의 done는 세션 스토어에 저장시키고 디시리얼에서 꺼내는것
  });

  passport.deserializeUser(async function (id, done) { //세션 스토어에서 passport:user의 값을 디시리얼라이즈 한다는의미임
    //모든페이지에 들어갈때마다 호출되는함수
    //session 폴더를 watch에서 제외하지 않으면 호출안됨!


    let user = await User.findOne({ id });
    console.log("desrializeuser ", id, user.id);
    done(null, user);//// 여기에 들어가는 데이터는->request.user로 주입된다. 
    //추후 request.user가 세션스토어를 참조하기때문임.
    //index.js에 코드추가되어있음
    //아래는 몽고디비에서 회원정보 갖고온다는 코드임
    // User.findById(id, function(err, user) {
    //   done(err, user);
    // });
  });

  passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pwd'
  }, // 이걸설정하지 않으면 입력폼에서 name="username", name=password 로 파라미터가 전달된다고 생각해 디폴트로처리한다.
    async function (id, password, done) {
      //위에서 설정한 email과 pwd가 폼에서 설정한 name과 일치하지 않으면 이 콜백은 실행되지않음
      console.log('LocalStrategy', id, password);

      let user = await User.findOne({ id: id });
      console.log(user);
      if (user) {
        console.log(1);
        bcrypt.compare(password, user.password, function (err, result) {
          if (result == true) {

            console.log(2);
            return done(null, user); // 성공시 홈으로 이동하게해두는데 indexjs에 홈 라우터
          } else {
            console.log(3, password, user.password);
            return done(null, false, { message: 'Incorrect _password.' });
          }
        });
      } else {
        console.log(4);
        //passport.authenticate 에서 failureFlash:true 추가시 세션의 flash메세지로 아래메세지추가
        return done(null, false, { message: 'Incorrect_id.' });
      }

    }
  ));
  return passport;
}