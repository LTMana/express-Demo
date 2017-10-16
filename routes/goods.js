const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Goods = require('../models/goods')
mongoose.connect('mongodb://118.89.201.107/db_demo?authSource=admin',{useMongoClient: true})

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected success')
})

mongoose.connection.on('error', () => {
  console.log('MongoDB connected error')
})

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB connected disconnected')
})

router.get('/list', (req, res, next) => {
  let page = parseInt(req.param('page'))
  let pageSize = parseInt(req.param('pageSize'))
  let priceLevel = req.param('pricelevel')
  let sort = req.param('sort')
  let skip = (page - 1) * pageSize
  let priceGt, priceLte
  const params = {}
  if (priceLevel != 'all') {
    switch (priceLevel) {
      case '0':
        priceGt = 0;
        priceLte = 100;
        break;
      case '1':
        priceGt = 100;
        priceLte = 500;
        break;
      case '2':
        priceGt = 500;
        priceLte = 1000;
        break;
      case '3':
        priceGt = 1000;
        priceLte = 5000;
        break;
    }
    params.salePrice = {
      $gt: priceGt,
      $lte: priceLte
    }
  }
  let goodsModel = Goods.find(params).skip(skip).limit(pageSize)
  goodsModel.sort({
    'salePrice': sort
  })
  goodsModel.exec((err, doc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message
      })
    } else {
      res.json({
        status: '0',
        msg: '',
        result: {
          count: doc.length,
          list: doc
        }
      })
    }
  })
})

router.post('/addCart', (req, res, next) => {
  const userId = '100000077'
  let productId = req.body.productId
  const User = require('../models/user')
  User.findOne({ userId }, (err, userDoc) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.message
      })
    } else {
      console.log('userDoc' + userDoc)
      if (userDoc) {
        let goodItem = null
        for (let item of userDoc.cartList) {
          if (item.productId == productId) {
            goodItem = item
            item.productNum++
          }
        }
        if (goodItem) {
          userDoc.save((err2, saveDoc) => {
            if (err2) {
              res.json({
                status: '1',
                msg: err2.message
              })
            } else {
              res.json({
                status: '0',
                msg: '',
                result: 'suc'
              })
            }
          })
        } else {
          Goods.findOne({ productId }, (err1, productDoc) => {
            if (err1) {
              res.json({
                status: '1',
                msg: err1.message
              })
            } else {
              if (productDoc) {
                productDoc.productNum = 1
                productDoc.checked = 1
                userDoc.cartList.push(productDoc)
                userDoc.save((err2, saveDoc) => {
                  if (err2) {
                    res.json({
                      status: '1',
                      msg: err2.message
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
      }
    }
  })
})

module.exports = router;