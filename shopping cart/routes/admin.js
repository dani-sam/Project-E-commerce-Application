var express = require('express');
var router = express.Router();
var productHelpers=require('../helpers/product-helpers')

/* GET users listing. */
router.get('/', function(req, res, next) {
  productHelpers.getAllProducts().then((product)=>{
    console.log(product);
    res.render('admin/views-products',{admin:true,product})
  })
  
});

router.get('/add-product',(req,res)=>{
  res.render('admin/add-product')
});

router.post('/add-product',(req,res)=>{
  console.log(req.body);
  console.log(req.files.Image);
  productHelpers.addProduct(req.body,(id)=>{
    let image=req.files.Image
    console.log(id);
    image.mv("./public/product-image/"+id+'.jpg', (err,done)=>{
      if(!err){
        res.render('admin/add-product')
      }else{
        console.log(err);
      }
    })
    
  })
})

module.exports = router;
