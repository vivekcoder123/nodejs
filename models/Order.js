const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');

const OrderSchema = new Schema({
    
    first_name:{
        type:String
    },
    last_name: {
        type: String
    },
    user_id:{
        type:Schema.Types.ObjectId,
        ref:"users"
    }
    ,
    email:{
        type:String
    },
    country: {
        type: String
    },
    phone:{
        type:String
    },
    address:{
        type:String
    },
    order_notes:{
        type:String
    },
    payment_status:{
        type:String
    },
    paypal_transaction_id:{
        type:String
    },
    date:{
        type:Date,
        default:Date.now()
    }
   
},{strict:false});

OrderSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('orders',OrderSchema);