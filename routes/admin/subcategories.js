const express = require('express');
const router = express.Router();
const SubCategory = require('../../models/SubCategory');
const {userAuthenticated} = require('../../helpers/authentication');
const Category = require('../../models/Category');
const cloudinary=require('../../config/cloudinary').cloud;

router.all('/*', userAuthenticated,(req,res,next)=>{
	req.app.locals.layout = 'admin';
	next();
});

router.get('/',(req,res)=>{
	SubCategory.find({}).populate('category').then(subcategories => {
        Category.find({}).then(categories=>{
            res.render('admin/subcategories/index', {subcategories,categories});
        });
	});
});

router.post('/create',(req,res)=>{
	SubCategory.findOne({name:req.body.name}).then(subcategory=>{
		if(subcategory==null){

			if(req.files.image.size!=0){

				cloudinary.uploader.upload(req.files.image.tempFilePath,{quality:"auto",format:"png"}).then(result=>{
					const subcategory = new SubCategory({
						name: req.body.name,
						image:result.secure_url
					});
					subcategory.save().then(savedSubcategory =>{
						req.flash('success_message', 'subcategory created !');
						res.redirect('/admin/subcategories');
					}).catch(err=>{
						console.log('err',err);
					});
				}).catch(err=>{
					console.log('err',err)
				});

			}else{

				const subcategory = new SubCategory({
					name: req.body.name
				});
				subcategory.save().then(savedSubcategory =>{
					req.flash('success_message', 'subcategory created !');
					res.redirect('/admin/subcategories');
				}).catch(err=>{
					console.log('err',err);
				});

			}

		}else{
			req.flash('error_message', 'subcategory already exists !');
			res.redirect('/admin/subcategories');
		}
	});
	
});

router.get('/edit/:id',(req,res)=>{
	SubCategory.findOne({_id:req.params.id}).then(subcategory => {
        Category.find({}).then(categories=>{
            res.render('admin/subcategories/edit', {subcategory,categories});
        });
	});
});


router.put('/edit/:id',(req,res)=>{
	SubCategory.findOne({_id:req.params.id}).then(subcategory => {
		subcategory.name = req.body.name;
		subcategory.category = req.body.category;
		if(req.files.image.size!=0){
			cloudinary.uploader.upload(req.files.image.tempFilePath,{quality:"auto",format:"png"}).then(result=>{
				subcategory.image=result.secure_url;
				subcategory.save().then(savedCategory =>{
					req.flash("success_message","subcategory updated successfully !");
					res.redirect('/admin/subcategories');
				});
			}).catch(err=>{
				console.log('err',err)
			});
		}else{
			subcategory.save().then(savedSubCategory =>{
				req.flash("success_message","subcategory updated successfully !");
				res.redirect('/admin/subcategories');
			});
		}
	});	
});

router.delete('/:id', (req,res) => {
	SubCategory.deleteOne({_id:req.params.id})
	.then(subcategory=>{			
		req.flash("success_message","subcategory deleted successfully !");
		res.redirect('/admin/subcategories');
	});
});



module.exports = router;