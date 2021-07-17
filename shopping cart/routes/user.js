var express = require('express');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers')

/* GET home page. */
router.get('/', function(req, res, next) {
  
  productHelpers.getAllProducts().then((product)=>{
    console.log(product);
    res.render('user/views-products',{product})
  })
});

module.exports = router;
