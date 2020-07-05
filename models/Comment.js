const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref:'users'
    },
    comment:{
        type:String,
        required:true
    },
    rating:{
        type:Number,
        required:true
    },
    approveComment:{
        type:Boolean,
        default: true
    },
    product_id:{
        type: Schema.Types.ObjectId,
        ref:'products'
    },
    date:{
        type:Date,
        defauld:Date.now()
    }
});

module.exports = mongoose.model('comments',CommentSchema);