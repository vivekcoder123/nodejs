const express = require('express');
const router = express.Router();
const Category = require('../../models/Category');
const SubCategory = require('../../models/SubCategory');
const {userAuthenticated} = require('../../helpers/authentication');
const Product = require('../../models/Product');
const cloudinary=require('../../config/cloudinary').cloud;

router.all('/*', userAuthenticated,(req,res,next)=>{
	req.app.locals.layout = 'admin';
	next();
});

router.get('/',(req,res)=>{
	Category.find({}).then(categories => {
		res.render('admin/categories/index', {categories});
	});
});

router.post('/create',(req,res)=>{
	Category.findOne({name:req.body.name}).then(category=>{
		console.log('category',category)
		if(category==null){
			if(req.files.image.size!=0){

				cloudinary.uploader.upload(req.files.image.tempFilePath,{quality:"auto",format:"png"}).then(result=>{
					const categories = new Category({
						name: req.body.name,
						image:result.secure_url
					});
					categories.save().then(savedCategory =>{
						req.flash('success_message', 'Category created !');
						res.redirect('/admin/categories');
					}).catch(err=>{
						console.log('err',err);
					});
				}).catch(err=>{
					console.log('err',err)
				});

			}else{

				const categories = new Category({
					name: req.body.name
				});
				categories.save().then(savedCategory =>{
					req.flash('success_message', 'Category created !');
					res.redirect('/admin/categories');
				}).catch(err=>{
					console.log('err',err);
				});

			}

		}else{
			req.flash('error_message', 'Category already exists !');
			res.redirect('/admin/categories');
		}
	}).catch(err=>{
		console.log('err',err);
	});

});

router.get('/edit/:id',(req,res)=>{
	Category.findOne({_id:req.params.id}).then(categories => {
		res.render('admin/categories/edit', {categories:categories});
	});
});


router.put('/edit/:id',(req,res)=>{
	Category.findOne({_id:req.params.id}).then(categories => {
		categories.name = req.body.name;
		categories.sequence = req.body.sequence
		if(req.files.image.size!=0){
			cloudinary.uploader.upload(req.files.image.tempFilePath,{quality:"auto",format:"png"}).then(result=>{
				categories.image=result.secure_url;
				categories.save().then(savedCategory =>{
					req.flash("success_message","Category updated successfully !");
					res.redirect('/admin/categories');
				});
			}).catch(err=>{
				console.log('err',err)
			});
		}else{
			categories.save().then(savedCategory =>{
				req.flash("success_message","Category updated successfully !");
				res.redirect('/admin/categories');
			});
		}
	});
});

router.delete('/:id', (req,res) => {
	Category.deleteOne({_id:req.params.id})
	.then(category=>{
		SubCategory.deleteMany({category:req.params.id}).then(subcategories=>{
			req.flash("success_message","Category deleted successfully !");
			res.redirect('/admin/categories');
		});
	});
});

router.get('/getSubcategories/:id',(req,res)=>{
	SubCategory.find({category:req.params.id}).then(subcategories=>{
		let response="";
		subcategories.forEach(subcat=>{
			response+=`<option value="${subcat._id}">${subcat.name}</option>`;
		});
		res.send(response);
	});
});

router.get('/getSelectedSubcategory/:id',(req,res)=>{
	Product.findOne({_id:req.params.id}).then(product=>{
		const subcat_id=product.subcategory;
		const cat_id=product.category;
		let response="";
		SubCategory.find({category:cat_id}).then(subcategories=>{
			subcategories.forEach(subcat=>{
				if(subcat._id.equals(subcat_id)){
					response+=`<option value="${subcat._id}" selected>${subcat.name}</option>`;
				}else{
					response+=`<option value="${subcat._id}">${subcat.name}</option>`;
				}
			});
			res.send(response);
		});
	});
});



module.exports = router;
