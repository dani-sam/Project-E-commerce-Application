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
        let proObj = {
            item: objectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve,reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {
                let proExist = userCart.product.findIndex(product => product.item == proId)
                console.log(proExist);
                if (proExist!=-1) {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ 'product.item': objectId(proId) },
                            {

                                $inc:{'product.$.quantity':1}

                            }
                        ).then(()=>{
                            resolve()
                        })
                }else{
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({user:objectId(userId)},
                    {

                            $push:{product:proObj}

                    }
                ).then((response)=>{
                    resolve()
                })
            }          
            } else {
                let cartObj = {
                    user: objectId(userId),
                    product: [proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },
    getCartProducts: (userId) => {
        return new Promise(async (reslove, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind:'$product'
                },
                {
                    $project:{
                        item:"$product.item",
                        quantity:"$product.quantity"
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:"item",
                        foreignField:"_id",
                        as:'products'
                    }
                }
               
            ]).toArray()

            reslove(cartItems)
        })
    },
    getCartCount: (userId) => {
        return new Promise(async (reslove, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (cart) {
                count = cart.product.length
            }
            reslove(count)
        })
    }
}