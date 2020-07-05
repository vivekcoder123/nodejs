const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const URLSlugs = require('mongoose-url-slugs');
const mongoosePaginate = require('mongoose-paginate');

const ProductSchema = new Schema({
    category:{
        type: Schema.Types.ObjectId,
        ref:'categories'
    },
    subcategory:{
        type: Schema.Types.ObjectId,
        ref:'subcategories'
    },
    room:{
        type: Schema.Types.ObjectId,
        ref:'rooms'
    },
    price:{
        type: Number,
        required:true
    },
    quantity:{
        type: Number,
        required:true
    },
    final_price:{
        type:Number,
        required:true
    }
    ,
    name:{
        type:String,
        required:true
    },
    slug: {
        type: String,
        index:true
    },
    status:{
        type:String,
        default:'publish'
    },
    description:{
        type:String
    },
	images:{
        type:Array,
        required:true
    },
    specifications:{
        type:Array
    },
    mainPoints:{
        type:Array
    },
    vendor:{
        type:String,
        required:true
    },
    brand:{
        type:String
    }
    ,
    size:{
        type:String
    }
    ,
    sizesAvailable:{
        type:String
    }
    ,
    color:{
        type:String
    }
    ,
    colorsAvailable:{
        type:String
    }
    ,
    tags:{
        type:Array,
        required:true
    },
    discount:{
        type:Number,
        required:true
    }
    ,
    show_in_deals_of_day:{
        type:Boolean,
        default:false
    }
    ,
    shipping_price:{
        type:Number
    }
    ,
    created_at:{
        type:Date,
        default:Date.now()
    }

},{usePushEach: true,strict:false});

ProductSchema.plugin(URLSlugs('name', {field: 'slug',update:true}));
ProductSchema.plugin(mongoosePaginate)

module.exports = mongoose.model('products',ProductSchema);