var express = require('express');
var router = express.Router();
const User = require('../models/user')
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('with resource');
});

router.post('/login',(req, res, next) => {
  const param = {}
  param.userName = req.body.userName
  param.userPwd = req.body.userPwd
  console.log(param)
  User.findOne(param, (err, userDoc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message
      })
    } else {
      console.log(userDoc)
      if (userDoc) {
        res.cookie('userId', userDoc.userId, {
          path: '/',
          maxAge: 1000 * 60 * 60
        })
        // req.session.user = doc
        res.json({
          status: '0',
          msg: '',
          result: {
            userName: userDoc.userName
          }
        })
      }
    }
  })
});

module.exports = router;

