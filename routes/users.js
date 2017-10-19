var express = require('express');
var router = express.Router();
const User = require('../models/user')
require('../util/util')
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('with resource')
})

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
      if (userDoc) {
        res.cookie('userId', userDoc.userId, {
          path: '/',
          maxAge: 1000 * 60 * 60
        })
        res.cookie('userName', userDoc.userName, {
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
})

router.post('/logout', (req, res, next) => {
  res.cookie('userId', '', {
    path: '/',
    maxAge: -1
  })
  res.cookie('userName', '', {
    path: '/',
    maxAge: -1
  })
  res.json({
    status: '0',
    msg: '',
    result: ''
  })
})

router.get('/checkLongin', (req, res, next) => {
  if (req.cookies.userId) {
    res.json({
      status: '0',
      msg: '',
      result: req.cookies.userName
    })
  } else {
    res.json({
      status: '1',
      msg: '未登录',
      result: ''
    })
  }
})

router.get('/cartList', (req, res, next) => {
  let userId = req.cookies.userId
  User.findOne({userId: userId}, (err, doc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      if (doc) {
        res.json({
          status: '0',
          msg: '',
          result: doc.cartList
        })
      }
    }
  })

})

router.post('/cartDel', (req, res, next) => {
  let userId = req.cookies.userId
  let productId = req.body.productId
  User.update({userId: userId}, {$pull: {'cartList': { productId }}} ,(err, doc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      if (doc) {
        res.json({
          status: '0',
          msg: '',
          result: 'suc'
        })
      }
    }
  })
})

router.post('/cartEdit', (req, res, next) => {
  let userId = req.cookies.userId
  let productId = req.body.productId
  let productNum = req.body.productNum
  let checked = req.body.checked
  User.update({userId: userId, 'cartList.productId': productId }, {'cartList.$.productNum' : productNum, 'cartList.$.checked': checked}, (err, doc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      if (doc) {
        res.json({
          status: '0',
          msg: '',
          result: 'suc'
        })
      }
    }
  })
})

router.post('/editCheckAll', (req, res, next) => {
  let userId = req.cookies.userId
  let checkAll = req.body.checkAll ? '1' : '0'
  User.findOne({userId: userId}, (err, doc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      if (doc) {
        for (let item of doc.cartList) {
          item.checked = checkAll
        }
        doc.save((err1, save) => {
          if (err1) {
            res.json({
              status: '1',
              msg: err1.message,
              result: ''
            })
          } else {
            res.json({
              status: '0',
              msg: '',
              result: 'suc'
            })
          }
        }) 
      }
    }
  })
})

router.get('/addressList', (req, res, next) => {
  let userId = req.cookies.userId
  User.findOne({userId: userId}, (err, doc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      res.json({
        status: '0',
        msg: '',
        result: doc.addressList
      })
    }
  })
})

router.post('/setDefault', (req, res, next) => {
  let userId = req.cookies.userId
  let addressId = req.body.addressId
  if (!addressId) {
    res.json({
      status: '1003',
      msg: 'addressId is null',
      result: ''
    })
  } else {
    User.findOne({userId: userId}, (err, doc) => {
      if (err) {
        res.json({
          status: '1',
          msg: err.message,
          result: ''
        })
      } else {
        if (doc) {
          let addressList = doc.addressList
          for (let item of addressList) {
            if (item.addressId === addressId) {
              item.isDefault = true
            } else {
              item.isDefault = false
            }
          }
          doc.save((err1, doc1) => {
            if (err1) {
              res.json({
                status: '1',
                msg: err.message,
                result: ''
              })
            } else {
              res.json({
                status: '0',
                msg: '',
                result: 'suc'
              })
            }
          })
        }
      }
    })
  }
 
})


router.post('/delAddress', (req, res, next) => {
  let userId = req.cookies.userId
  let addressId = req.body.addressId
  User.update({userId: userId}, {$pull: {'addressList': { addressId }}} ,(err, doc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      if (doc) {
        res.json({
          status: '0',
          msg: '',
          result: 'suc'
        })
      }
    }
  })
 
})

router.post('/payMent', (req, res, next) => {
  let userId = req.cookies.userId
  let orderTotal = req.body.orderTotal
  let addressId = req.body.addressId
  if (!orderTotal) {
    res.json({
      status: '1003',
      msg: 'orderTotal is null',
      result: ''
    })
  } else {
    User.findOne({userId: userId}, (err, doc) => {
      if (err) {
        res.json({
          status: '1',
          msg: err.message,
          result: ''
        })
      } else {
        if (doc) {
          // 获取当前用户的地址信息
          let address = ''
          let addressList = doc.addressList
          for (let item of addressList) {
            if (item.addressId === addressId) {
              address = item
            }
          }
          // 获取用户购物车的购买商品
          let goodsList = []
          for (let item of doc.cartList) {
            if (item.checked === '1') {
              goodsList.push(item)
            }
          }
          let r1 = Math.floor(Math.random() * 10)
          let r2 = Math.floor(Math.random() * 10)
          let platform = '622'
          let sysDate = new Date().Format('yyyyMMddhhmmss')
          let createDate = new Date().Format('yyyy-MM-dd hh:mm:ss')
          let orderId = platform + r1 + sysDate + r2
          let order = {
            orderId: orderId,
            orderTotal: orderTotal,
            addressInfo: address,
            goodsList: goodsList,
            orderStatus: '1',
            createDate: createDate
          }
          doc.orderList.push(order)
          doc.save((err1, doc1) => {
            if (err1) {
              res.json({
                status: '1',
                msg: err.message,
                result: ''
              })
            } else {
              res.json({
                status: '0',
                msg: '',
                result: {
                  orderId: order.orderId,
                  orderTotal: order.orderTotal
                }
              })
            }
          })
        }
      }
    })
  }
 
})


router.get('/orderDetail', (req, res, next) => {
  let userId = req.cookies.userId
  let orderId = req.param('orderId')
  User.findOne({ userId } ,(err, doc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message,
        result: ''
      })
    } else {
      let orderList = doc.orderList
      if (orderList.length > 0) {
        let orderTotal = 0
        for (let item of orderList) {
          if (item.orderId === orderId) {
            orderTotal = item.orderTotal
          }
        }
        if (orderTotal > 0) {
          res.json({
            status: '0',
            msg: '',
            result: {
              orderId: orderId,
              orderTotal: orderTotal
            }
          })
        } else {
          res.json({
            status: '120002',
            msg: '无此订单',
            result: ''
          })
        }
      } else {
        res.json({
          status: '120001',
          msg: '当前用户未创建订单',
          result: ''
        })
      }
    }
  })
})



module.exports = router;

