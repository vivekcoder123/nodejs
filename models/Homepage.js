const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HomepageSchema = new Schema({
    
    carousel_images:{
        type:Array
    },
    top_side_ad_1:{
        type:String
    },
    top_side_ad_2:{
        type:String
    },
    mid_page_ad_1:{
        type:String
    },
    mid_page_ad_2:{
        type:String
    },
    mid_page_ad_3:{
        type:String
    },
    bottom_page_ad_1:{
        type:String
    },
    bottom_page_ad_2:{
        type:String
    },
    android_app:{
        type:String
    },
    type:{
        type:String,
        default:"homepage"
    },
    carousel_images_link:{
        type:Array
    },
    top_side_ad_1_link:{
        type:String
    },
    top_side_ad_2_link:{
        type:String
    },
    mid_page_ad_1_link:{
        type:String
    },
    mid_page_ad_2_link:{
        type:String
    },
    mid_page_ad_3_link:{
        type:String
    },
    bottom_page_ad_1_link:{
        type:String
    },
    bottom_page_ad_2_link:{
        type:String
    },
    android_app_link:{
        type:String
    }
});
module.exports = mongoose.model('homepage',HomepageSchema);