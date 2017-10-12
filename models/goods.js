const mongoose = require('mongoose'),
      Schema = mongoose.Schema

const produtSchema = new Schema({
  'productId': String,
  'productName': String,
  'salePrice': Number,
  'productNum': Number,
  'checked': Number,
  'productImage': String
})

module.exports = mongoose.model('Good', produtSchema)
