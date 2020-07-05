const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');
const URLSlugs = require('mongoose-url-slugs');

const SubCategorySchema = new Schema({
    
    name:{
        type:String,
        required:true
    },
    slug: {
        type: String,
        index:true
    },
    image:{
        type:String
    }
    ,
    category:{
        type:Schema.Types.ObjectId,
        ref:'categories'
    },
    date:{
        type:Date,
        default:Date.now()
    }
   
});
SubCategorySchema.plugin(mongoosePaginate)
SubCategorySchema.plugin(URLSlugs('name', {field: 'slug',update:true}));
module.exports = mongoose.model('subcategories',SubCategorySchema);