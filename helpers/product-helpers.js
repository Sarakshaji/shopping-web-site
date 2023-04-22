var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
var objectId=require('mongodb').ObjectId

module.exports={

    AdminSignup:(adminData)=>{
        
        return new Promise(async(resolve,reject)=>{
            adminData.password=await bcrypt.hash(adminData.password,10)
            db.get().collection(collection.ADMIN_COLLECTION).insertOne(adminData).then((data)=>{
                //console.log(data)
                resolve(data.insertedId)
            })
        })

       },

       AdminLogin:(adminData)=>{
        return new Promise(async (resolve,reject)=>{
            let loginstatus=false
            let response={}
            let admin=await db.get().collection(collection.ADMIN_COLLECTION).findOne({email:adminData.email})
            if(admin){
                bcrypt.compare(adminData.password,admin.password).then((status)=>{
                    if(status){
                        console.log("login sucess")
                        response.admin=admin
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




    addproduct:(product,callback)=>{
        
        db.get().collection('product').insertOne(product).then((data)=>{
            console.log(data)
            
            callback(data.insertedId)
        })
    },
    getAllProduct:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTIONS).find().toArray()
            resolve(products)

        })
    },
    deleteProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTIONS).deleteOne({_id:new objectId(proId)}).then((response)=>{
                //console.log(response)
                resolve(response)
            })
        })
    },
    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id:new objectId(proId)}).then((product)=>{
                resolve(product)
            })
        })

    },
    updateProduct:(proId,proDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTIONS)
            .updateOne({_id:new objectId(proId)},{
                $set:{
                    name:proDetails.name,
                    description:proDetails.description,
                    price:proDetails.price,
                    category:proDetails.category
                }

            }).then((response)=>{
                resolve()
            })
        })
    }
    
    
        

    
   


    
}


