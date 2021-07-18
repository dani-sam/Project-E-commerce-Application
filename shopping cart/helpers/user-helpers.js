var db=require('../config/connection')
var collection=require("../config/collections")
const bcrypt=require('bcrypt')

module.exports={
    doSignup:(userData)=>{
        return new Promise(async(reslove,reject)=>{
            userData.Password=await bcrypt.hash(userData.Password,10)
            db.get().collection(collection.USER_COLLECTION).insertOne (userData).then((data)=>{
                reslove(data.ops[0])
            })
        })
    },
    doLogin:(userData)=>{
        return new Promise(async(reslove,reject)=>{
            let loginStatus=false
            let response={}
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email})
            if(user){
                bcrypt.compare(userData.Password,user.Password).then((status)=>{
                    if(status){
                        console.log("login success");
                        response.user=user
                        response.status=true
                        reslove(response)
                    }else{
                        console.log("login failed");
                        reslove({status:false})
                    }
                })
            }else{
                console.log("login failed");
                reslove({status:false})
            }
        })
    }
}