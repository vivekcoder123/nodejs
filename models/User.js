const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    
    first_name:{
        type:String,
        required:true
    },
    last_name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    city:{
        type:String
    },
    country:{
        type:String
    },
    gender:{
        type:String
    },
    phone:{
        type:String
    },
    address:{
        type:String
    },
    verified:{
        type:Number,
        default:0
    },
    token:{
        type:String
    }
   
});

module.exports = mongoose.model('users',UserSchema);