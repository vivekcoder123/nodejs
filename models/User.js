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
        type:String
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
    }
   
});

module.exports = mongoose.model('users',UserSchema);