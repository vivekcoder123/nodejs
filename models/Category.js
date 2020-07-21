const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');
const URLSlugs = require('mongoose-url-slugs');

const CategorySchema = new Schema({

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
    date:{
        type:Date,
        default:Date.now()
    },
    sequence: {
        type: Number
    }

},{strict:false});

CategorySchema.plugin(mongoosePaginate)
CategorySchema.plugin(URLSlugs('name', {field: 'slug',update:true}));
module.exports = mongoose.model('categories',CategorySchema);
