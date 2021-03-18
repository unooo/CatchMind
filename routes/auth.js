var express = require('express');
var router = express.Router();
const shortid = require('shortid');
const bcrypt = require('bcrypt');
const saltRounds = 10; //일종의 노이즈
let User = require('../schemas/user');

module.exports = function (passport) {


  router.get('/login', function (request, response) {
    const ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    response.render('login', { ip });
  });

  router.get('/logout', function (request, response) {

    request.logout();
    request.session.destroy(function (err) {
      response.redirect('/');
    })

  })


  router.post('/login_process', function (req, res, next) {

    passport.authenticate('local', function (err, userLove, info) {
      if (err) {
        console.error(err);
        return next(err);
      }
      if (!userLove) {
        console.log('loginError', info.message);
        return res.redirect('/auth/login?ret=' + info.message);
      }

      return req.logIn(userLove, function (err) { //여기서 userlove 는  serializeuser의 userlove로 넘겨준다
        console.log('start log in');
        if (err) { console.log(err); return next(err); }

        return res.redirect('/');
      });

    })(req, res, next);
  });
  return router;
}

router.get('/register', function (request, response) {
  const ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;

  response.render('register', { ip });
});

router.post('/register_process', async function (request, response) {

  var post = request.body;
  var id = post.id;
  var pwd = post.pwd;
  var pwd2 = post.pwd2;
  var displayName = post.displayName;

  let checkDuplicateId = await User.findOne({ id });
  console.log('checkDuplicateId ', checkDuplicateId)
  if (checkDuplicateId) {
    response.redirect('/auth/register?ret=ID_duplicated');
    return false;
  }

  if (pwd !== pwd2) {
    //request.flash('error', 'password must same!');
    response.send('/auth/register?ret=password_must_same!');
    return false;
  } else {
    bcrypt.hash(pwd, saltRounds, async function (err, hash) {

      const user = new User({
        id,
        password: hash,
        name: displayName,
      })

      user.save().then(res => {

        request.login(user, function (err) {
          return response.redirect('/');
        })

      }).catch(error => {
        console.log(error);
        //에러처리 지금은 무조건 성공한다고 가정
      });

    });

  }

});