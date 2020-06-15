const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubCategorySchema = new Schema({
    
    name:{
        type:String,
        required:true
    },
    category:{
        type:Schema.Types.ObjectId,
        ref:'categories'
    },
    date:{
        type:Date,
        default:Date.now()
    }
   
});

module.exports = mongoose.model('subcategories',SubCategorySchema);