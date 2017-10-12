const mongoose = require('mongoose'),
      Schema = mongoose.Schema

const userSchema = new Schema({
  'userId': String,
  'userName': String,
  'userPwd': Number,
  'orderList': Array,
  'cartList': [
    {
      'productId': String,
      'productName': String,
      'salePrice': String,
      'productImage': String,
      'productNum': Number,
      'checked': String,
      'productName': String
    }  
  ],
  'addressList': Array
})

module.exports = mongoose.model('User', userSchema)