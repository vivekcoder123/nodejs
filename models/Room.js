const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');
const URLSlugs = require('mongoose-url-slugs');

const RoomSchema = new Schema({
    
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
    }
   
},{strict:false});

RoomSchema.plugin(mongoosePaginate)
RoomSchema.plugin(URLSlugs('name', {field: 'slug',update:true}));
module.exports = mongoose.model('rooms',RoomSchema);