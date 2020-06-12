const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const URLSlugs = require('mongoose-url-slugs');

const ProductSchema = new Schema({
    category:{
        type: Schema.Types.ObjectId,
        ref:'categories'
    },
    subcategory:{
        type: Schema.Types.ObjectId,
        ref:'subcategories'
    },
    price:{
        type: Number,
        required:true
    },
    quantity:{
        type: Number,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    slug: {
        type: String
    },
    status:{
        type:String,
        default:'publish'
    },
    description:{
        type:String,
        required:true
    },
	image:{
        type:String,
        required:true
    },
    specification:{
        type:String,
        required:true
    },
    vendor:{
        type:String,
        required:true
    },
    created_at:{
        type:Date,
        default:Date.now()
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'reviews'
    }],

},{usePushEach: true});

ProductSchema.plugin(URLSlugs('name', {field: 'slug'}));

module.exports = mongoose.model('products',ProductSchema);