const express = require('express');
const router = express.Router();
const Product = require('../../models/Product');
const Category = require('../../models/Category');
const Comment = require('../../models/Comment');
const Homepage = require('../../models/Homepage');
const {userAuthenticated} = require('../../helpers/authentication');
const cloudinary=require('../../config/cloudinary').cloud;


router.all('/*', userAuthenticated,(req,res,next)=>{
	req.app.locals.layout = 'admin';
	next();
});

router.get('/',(req,res)=>{

	//this can also be done in this way
	//const promises = [
		//Post.count().exec(),
		//Category.count().exec(),
		//Comment.count().exec()
	//];
	//Promise.all(promises).then(([postCount, categoryCount, commentCount])=>{
		//res.render('admin/index',{postCount:postCount, categoryCount:categoryCount, commentCount:commentCount});
	//});

	res.render('admin/index');	
});

router.get('/dashboard',(req,res)=>{
	res.render('admin/index');
});

router.get('/homepage_ads',(req,res)=>{
	Homepage.findOne({type:'homepage'}).then(homepage=>{
		res.render('admin/homepage_ads',{homepage});
	});
});

router.post('/save_ads',async (req,res)=>{

	Homepage.findOne({type:"homepage"}).then(async (homepage)=>{

		if(homepage==null){
			homepage=new Homepage();
		}

		if(req.files.carousel_images.size!=0){
			let carousel_images=[];
			if(typeof req.files.carousel_images.length !="undefined"){
	
				for(const image of req.files.carousel_images){
					const cloudRes=await cloudinary.uploader.upload(image.tempFilePath,{quality:"auto",format:"webp"});
					carousel_images.push(cloudRes.secure_url);
				}
	
			}else{
	
				const cloudRes=await cloudinary.uploader.upload(req.files.carousel_images.tempFilePath,{quality:"auto",format:"webp"});
				carousel_images.push(cloudRes.secure_url);
			}
			
			homepage.carousel_images=carousel_images;
		}

		if(req.files.top_side_ad_1.size!=0){

			const cloudRes=await cloudinary.uploader.upload(req.files.top_side_ad_1.tempFilePath,{quality:"auto",format:"webp"});
			homepage.top_side_ad_1=cloudRes.secure_url;

		}

		if(req.files.top_side_ad_2.size!=0){

			const cloudRes=await cloudinary.uploader.upload(req.files.top_side_ad_2.tempFilePath,{quality:"auto",format:"webp"});
			homepage.top_side_ad_2=cloudRes.secure_url;

		}

		if(req.files.mid_page_ad_1.size!=0){

			const cloudRes=await cloudinary.uploader.upload(req.files.mid_page_ad_1.tempFilePath,{quality:"auto",format:"webp"});
			homepage.mid_page_ad_1=cloudRes.secure_url;

		}

		if(req.files.mid_page_ad_2.size!=0){

			const cloudRes=await cloudinary.uploader.upload(req.files.mid_page_ad_2.tempFilePath,{quality:"auto",format:"webp"});
			homepage.mid_page_ad_2=cloudRes.secure_url;

		}

		if(req.files.mid_page_ad_3.size!=0){

			const cloudRes=await cloudinary.uploader.upload(req.files.mid_page_ad_3.tempFilePath,{quality:"auto",format:"webp"});
			homepage.mid_page_ad_3=cloudRes.secure_url;

		}

		if(req.files.bottom_page_ad_1.size!=0){

			const cloudRes=await cloudinary.uploader.upload(req.files.bottom_page_ad_1.tempFilePath,{quality:"auto",format:"webp"});
			homepage.bottom_page_ad_1=cloudRes.secure_url;

		}
		
		if(req.files.bottom_page_ad_2.size!=0){

			const cloudRes=await cloudinary.uploader.upload(req.files.bottom_page_ad_2.tempFilePath,{quality:"auto",format:"webp"});
			homepage.bottom_page_ad_2=cloudRes.secure_url;

		}

		if(req.files.android_app.size!=0){

			const cloudRes=await cloudinary.uploader.upload(req.files.android_app.tempFilePath,{quality:"auto",format:"webp"});
			homepage.android_app=cloudRes.secure_url;

		}

		if(req.body.carousel_images_link){
			homepage.carousel_images_link=req.body.carousel_images_link;
		}

		if(req.body.top_side_ad_1_link){
			homepage.top_side_ad_1_link=req.body.top_side_ad_1_link;
		}
		
		if(req.body.top_side_ad_2_link){
			homepage.top_side_ad_2_link=req.body.top_side_ad_2_link;
		}

		if(req.body.mid_page_ad_1_link){
			homepage.mid_page_ad_1_link=req.body.mid_page_ad_1_link;
		}

		if(req.body.mid_page_ad_2_link){
			homepage.mid_page_ad_2_link=req.body.mid_page_ad_2_link;
		}

		if(req.body.mid_page_ad_3_link){
			homepage.mid_page_ad_3_link=req.body.mid_page_ad_3_link;
		}

		if(req.body.bottom_page_ad_1_link){
			homepage.bottom_page_ad_1_link=req.body.bottom_page_ad_1_link;
		}

		if(req.body.bottom_page_ad_2_link){
			homepage.bottom_page_ad_2_link=req.body.bottom_page_ad_2_link;
		}

		if(req.body.android_app_link){
			homepage.android_app_link=req.body.android_app_link;
		}

		homepage.save().then(response=>{
			req.flash('success_message', `homepage ads was updated succesfully`);	
			res.redirect('/admin/homepage_ads');
		}).catch(err=>console.log('err',err));

	}).catch(err=>console.log('err',err));
	
});

router.get('/delete_ads_image/:name/:id',(req,res)=>{
	Homepage.findOne({_id:req.params.id}).then(homepage=>{
		console.log('homepage',homepage);
		homepage[req.params.name]=null;
		homepage.save().then(response=>{
			req.flash('success_message', `homepage ads was updated succesfully`);	
			res.redirect('/admin/homepage_ads');
		}).catch(err=>console.log('err',err));
	})
});

module.exports = router;