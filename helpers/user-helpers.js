var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
var objectId=require('mongodb').ObjectId


module.exports={
    doSignup:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            userData.password=await bcrypt.hash(userData.password,10)
            db.get().collection(collection.USER_COLLECTIONS).insertOne(userData).then((data)=>{
                resolve(data.insertedId)
            })
        })

    },


    doLogin:(userData)=>{
        return new Promise(async (resolve,reject)=>{
            let loginstatus=false
            let response={}
            let user=await db.get().collection(collection.USER_COLLECTIONS).findOne({email:userData.email})
            if(user){
                bcrypt.compare(userData.password,user.password).then((status)=>{
                    if(status){
                        console.log("login sucess")
                        response.user=user
                        response.status=true
                        resolve(response)
                    }
                    else{
                        console.log("login failed")
                        resolve({status:false})
                    }

                })
            }
            else{
                console.log("loggin problem")
                resolve({status:false})

            }
        })
    },

    addToCart:(proId,userId)=>{
        let proObj={
            item:new objectId(proId),
            quantity:1
        }
        return new Promise(async (resolve,reject)=>{
            let userCart=await db.get().collection(collection.CART_COLLECTIONS).findOne({user:new objectId(userId)})
            if(userCart){
                let proExist=userCart.products.findIndex(product=> product.item==proId)
                console.log(proExist)
                if(proExist!=-1){
                    db.get().collection(collection.CART_COLLECTIONS)
                    .updateOne({user:new objectId(userId),'products.item':new objectId(proId)},
                    {
                        $inc:{'products.$.quantity':1}
                    }
                    ).then(()=>{
                        resolve()
                    })
                }
                else{
                 db.get().collection(collection.CART_COLLECTIONS)
                 .updateOne({user:new objectId(userId)},
                 {
                    
                         $push:{products:proObj}
                    

                 }
                
                 ).then((response)=>{
                     resolve()
                 })

                }

            }
            else{
                let cartObj={
                    user:new objectId(userId),
                    products:[proObj]
                }
                db.get().collection(collection.CART_COLLECTIONS).insertOne(cartObj).then((response)=>{
                    resolve()
                })
            }
        })
    },
    getCartProducts:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cartItems=await db.get().collection(collection.CART_COLLECTIONS).aggregate([
                {
                    $match:{user:new objectId(userId)}
                },
                {
                    $unwind:"$products"
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTIONS,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                }
            ]).toArray()
            resolve(cartItems)
        })
                     
                
                       
               
                
            
            
               

    },

    getCartCount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let count=0
            let cart=await db.get().collection(collection.CART_COLLECTIONS).findOne({user:new objectId(userId)})
            if(cart){
                count=cart.products.length
            }
            resolve(count)
        })
    },

     changeProductQuantity:(details)=>{
         details.count=parseInt(details.count)
         details.quantity=parseInt(details.quantity)

         //console.log(details)
         return new Promise((resolve,reject)=>{
            if(details.count==-1 && details.quantity==1){

             db.get().collection(collection.CART_COLLECTIONS)
                     .updateOne({_id:new objectId(details.cart)},
                     {
                         $pull:{products:{item:new objectId(details.product)}}
                     }
                     ).then((response)=>{
                        //console.log(response)
                         resolve({removeProduct:true})
                     })

            }
            else{
                db.get().collection(collection.CART_COLLECTIONS)
                     .updateOne({_id:new objectId(details.cart),'products.item':new objectId(details.product)},
                     {
                         $inc:{'products.$.quantity':details.count}
                     }
                     ).then((response)=>{
                        //console.log(response)
                         resolve({status:true})
                     })

            }

         })

     },

     

      getTotalAmount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
        let total=await db.get().collection(collection.CART_COLLECTIONS).aggregate([
        {
            $match:{user:new objectId(userId)}
        },
        {
            $unwind:"$products"
        },
        {
            $project:{
                item:'$products.item',
                quantity:'$products.quantity'
            }
        },
        {
            $lookup:{
                from:collection.PRODUCT_COLLECTIONS,
                localField:'item',
                foreignField:'_id',
                as:'product'
            }
        },
        {
            $project:{
                item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
            }
        },
        {
            $group:{
                _id:null,
                
                total:{$sum:{$multiply:[{$toInt:"$quantity"},{$toInt:"$product.price"}]}}
               
              

            }
        }

      ]).toArray()     
    //console.log("total",total[0].total)
    let value=total[0].total
    resolve(value)
})

      },


      RemoveProduct:(details)=>{
        return new Promise(async(resolve,reject)=>{

           await db.get().collection(collection.CART_COLLECTIONS)
                     .updateOne({_id:new objectId(details.cart)},
                     {
                         $pull:{products:{item:new objectId(details.product)}}
                     }
                     ).then((response)=>{
                        //console.log(response)
                         resolve({removeProduct:true})
                     })

        })
      },


      

      placeOrder:(order,products,total)=>{
        return new Promise((resolve,reject)=>{
            console.log(order,products,total)
            let status=order['payment-method']==='cod'?'placed':'pending'
            let orderObj={
                deliveryDetails:{
                    mobile:order.mobile,
                    address:order.address,
                    pincode:order.pincode
                },
                userId:new objectId(order.userId),
                paymentMethod:order['payment-method'],
                products:products,
                totalAmount:total,
                status:status,
                date:new Date()
            }

            db.get().collection(collection.ORDER_COLLECTIOS).insertOne(orderObj).then((response)=>{
                db.get().collection(collection.CART_COLLECTIONS).deleteOne({user:new objectId(order.userId)})
                resolve()
            })

        })

      },

      getCartProductsList:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cart=await db.get().collection(collection.CART_COLLECTIONS).findOne({user:new objectId(userId)})
            resolve(cart.products)
            
        })

      },

      getUserOrders:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            console.log(userId)
        let orders=await db.get().collection(collection.ORDER_COLLECTIOS)
        .find({userId:new objectId(userId)}).toArray()
        console.log(orders)
        resolve(orders)
        })

      },

    getOrderProducts:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            let orderItems=await db.get().collection(collection.ORDER_COLLECTIOS).aggregate([
                {
                    $match:{_id:new objectId(orderId)}
                },
                {
                    $unwind:"$products"
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTIONS,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                }
            ]).toArray()
            resolve(orderItems)
        })
                     
                
                       
               
    }



      


}


                    
               
                
            
                        