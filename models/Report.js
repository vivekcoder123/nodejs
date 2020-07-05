const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');

const ReportSchema = new Schema({
    
    product_name:{
        type:String
    },
    product_price: {
        type: Number
    },
    shipping_price: {
        type: Number
    },
    product_quantity:{
        type:String
    }
    ,
    order_id:{
        type:Schema.Types.ObjectId,
        ref:"orders"
    },
    product_id:{
        type:Schema.Types.ObjectId,
        ref:"products"
    },
    user_id:{
        type:Schema.Types.ObjectId,
        ref:"users"
    },
    order_status:{
        type:String
    },
    date:{
        type:Date,
        default:Date.now()
    }
   
},{strict:false});

ReportSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('reports',ReportSchema);