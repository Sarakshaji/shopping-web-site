var express = require('express');
var router = express.Router();
var producthelper=require('../helpers/product-helpers')


/* GET users listing. */




router.get('/', function(req, res, next) {

  producthelper.getAllProduct().then((products)=>{
    //console.log(products)
    res.render('admin/view-products',{admin:true,products})

  })

  
  
});

router.get('/add-product',function(req,res){
  res.render('admin/add-product')
})

router.post('/add-product',(req,res)=>{
  //console.log(req.body)
  //console.log(req.files.Image)
  producthelper.addproduct(req.body,(id)=>{
    let image=req.files.Image
    //console.log(id)
    image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
      if(!err){
        res.render("admin/add-product")
      }
      else{
        console.log(err)
      }
      
    })
    
  })


})

router.get('/delete-product/:id',(req,res)=>{
  let proId=req.params.id
  //console.log(proId)
  producthelper.deleteProduct(proId).then((response)=>{
    res.redirect('/admin/')
  })
})

router.get('/edit-product/:id',async (req,res)=>{
  let product=await producthelper.getProductDetails(req.params.id)
  //console.log(product)
  res.render('admin/edit-product',{product})
})

router.post('/edit-product/:id',(req,res)=>{
  console.log(req.params.id)
  let id=req.params.id
  producthelper.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect('/admin/')
    if(req.files.Image)
    {
      let image=req.files.Image
      image.mv('./public/product-images/'+id+'.jpg')

    }
  })
})

router.get("/adminsignup",(req,res)=>{
  res.render('admin/admin-signup')
})

router.get('/admin-login',(req,res)=>{
  res.render('admin/admin-login')
})

router.post('/admin-signup',(req,res)=>{
console.log(req.body)
  producthelper.AdminSignup(req.body).then((response)=>{
    console.log(response)
    //res.redirect('/admin')
  })
})

  router.post('/admin-login',(req,res)=>{
    producthelper.AdminLogin(req.body).then((response)=>{
      if(response.status){
        
        req.session.admin=response.admin
        req.session.admin.loggedIn=true
        res.redirect('/admin/')
      }
      else{
        req.session.userLoginErr="invalid email or password"
        res.redirect('/login')
      }
    })
    
  })







     
  








module.exports = router;
