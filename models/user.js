const { required } = require("joi");
const mongoose= require("mongoose");
const Schema=mongoose.Schema;
//USING PASSPORT LOCAL MONGOOSE
const passportLocalMongoose= require("passport-local-mongoose");

const userSchema= new Schema({
    email:{
        type:String,
        required:true
    }
});

//CONFIGURING PASSPORTLOCALMONGOOSE
userSchema.plugin(passportLocalMongoose);

module.exports=mongoose.model("User",userSchema);