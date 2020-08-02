const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');
const URLSlugs = require('mongoose-url-slugs');

const SavedForLaterSchema = new Schema({

    user_id:{
        type: Schema.Types.ObjectId,
        ref:'users'
    },
    product_id: {
        type: Schema.Types.ObjectId,
        ref:'products'
    },
    date:{
        type:Date,
        default:Date.now()
    }

},{strict:false});

SavedForLaterSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('saved_for_later',SavedForLaterSchema);
