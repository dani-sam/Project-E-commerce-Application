var db = require('../config/connection')
var collection = require("../config/collections")
const bcrypt = require('bcrypt')
var objectId = require('mongodb').ObjectID
const { response } = require('express')

module.exports = {
    doSignup: (userData) => {
        return new Promise(async (reslove, reject) => {
            userData.Password = await bcrypt.hash(userData.Password, 10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                reslove(data.ops[0])
            })
        })
    },
    doLogin: (userData) => {
        return new Promise(async (reslove, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email })
            if (user) {
                bcrypt.compare(userData.Password, user.Password).then((status) => {
                    if (status) {
                        console.log("login success");
                        response.user = user
                        response.status = true
                        reslove(response)
                    } else {
                        console.log("login failed");
                        reslove({ status: false })
                    }
                })
            } else {
                console.log("login failed");
                reslove({ status: false })
            }
        })
    },
    addToCart: (proId, userId) => {
        return new Promise(async (reslove, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({user:objectId(userId)},
                    {
                        
                            $push:{product:objectId(proId)}
                        
                    }
                ).then((response)=>{
                    reslove()
                })          
            } else {
                let cartObj = {
                    user: objectId(userId),
                    product: (objectId(proId))
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    reslove()
                })
            }
        })
    },
    getCartProducts:(userId)=>{
        return new Promise(async(reslove,reject)=>{
            let cartItems=await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:objectId(userId)}
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        let:{prodList:'$product'},
                        pipeline:[
                            {

                                $match:{
                                    $expr:{
                                        $in:['$_id',"$$prodList"]
                                    }              
                                }
                            }
                        ],
                        as:"cartItems"

                    }
                }
            ]).toArray()
            reslove(cartItems[0].cartItems)
        })
    }
}