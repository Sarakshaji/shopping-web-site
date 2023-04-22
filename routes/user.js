var express = require('express');
var router = express.Router();

var producthelper=require('../helpers/product-helpers');

const userHelper=require('../helpers/user-helpers')



const verifyLogin=(req,res,next)=>{
  if(req.session.user.loggedIn){
    next()
  }
  else{
    res.redirect('/login')
  }

}

/* GET home page. */
router.get('/',async function(req, res, next) {
  let user=req.session.user
  console.log(user)
  let cartCount=null
  if(req.session.user){
  cartCount=await userHelper.getCartCount(req.session.user._id)
  }

  producthelper.getAllProduct().then((products)=>{
    //console.log(products)
    res.render('user/view-products',{admin:false,products,user,cartCount})

  })

  //res.render('index', { products,admin:false });
});

router.get("/login",(req,res)=>{
  console.log(req.session.user)
  if(req.session.user){
    
    res.redirect('/')
  }
  else{
    res.render('user/login',{"loginErr":req.session.userLoginErr})
    req.session.userLoginErr=false
  }
})

router.get("/signup",(req,res)=>{
  res.render('user/signup')
})

router.post('/signup',(req,res)=>{
  userHelper.doSignup(req.body).then((response)=>{
    //console.log(response)
    //req.session.loggedIn=true
    //req.session.user=response
    res.redirect('/')
  
    
  })

  

})


router.post('/login',(req,res)=>{
  userHelper.doLogin(req.body).then((response)=>{
    if(response.status){
      
      req.session.user=response.user
      req.session.user.loggedIn=true
      res.redirect('/')
    }
    else{
      req.session.userLoginErr="invalid email or password"
      res.redirect('/login')
    }
  })
})

router.get('/logout',(req,res)=>{
  req.session.user=null
 // req.session.userLoggedIn=null
  res.redirect('/')
})

router.get('/cart',verifyLogin,async (req,res)=>{
  let products=await userHelper.getCartProducts(req.session.user._id)
  let totalValue=await userHelper.getTotalAmount(req.session.user._id)
  //console.log(products[0].cartItems)
  //let pro=products[0].cartItems
  //console.log('***'+req.session.user._id)
  res.render('user/cart',{products,user:req.session.user._id,totalValue})
})

router.get('/add-to-cart/:id',(req,res)=>{
  console.log("api call sucess")

  userHelper.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.json({status:true})
    //res.redirect('/')
  })

  

  })


  router.post('/change-product-quantity',(req,res)=>{
    //console.log(req.body)
    userHelper.changeProductQuantity(req.body).then(async(response)=>{
      response.total=await userHelper.getTotalAmount(req.body.user)
      res.json(response)
    
    })
  })

  router.get('/place-order',verifyLogin,async (req,res)=>{
    let total=await userHelper.getTotalAmount(req.session.user._id)
    res.render('user/place-order',{total,user:req.session.user})
  })

  router.post('/remove-product',(req,res)=>{
    //console.log(req.body)
    userHelper.RemoveProduct(req.body).then(async(response)=>{
      
      res.json(response)

    })
  })

  router.post('/place-order',async(req,res)=>{
    let products=await userHelper.getCartProductsList(req.body.userId)
    let totalPrice=await userHelper.getTotalAmount(req.body.userId)
    userHelper.placeOrder(req.body,products,totalPrice).then((response)=>{
       res.json({status:true})
    })
    console.log(req.body)
  })

  router.get('/order-success',(req,res)=>{
    res.render('user/order-success',{user:req.session.user})
  })

  router.get('/orders',async(req,res)=>{
    let orders=await userHelper.getUserOrders(req.session.user._id)
    res.render('user/orders',{user:req.session.user,orders})
  })

  router.get('/view-order-products/:id',async(req,res)=>{
    let products=await userHelper.getOrderProducts(req.params.id)
    res.render('user/view-order-products',{user:req.session.user,products})

  })


module.exports = router;
