const express = require('express');
const router = express.Router();
const Category = require('../../models/Category');
const SubCategory = require('../../models/SubCategory');
const {userAuthenticated} = require('../../helpers/authentication')



router.all('/*', userAuthenticated,(req,res,next)=>{
	req.app.locals.layout = 'admin';
	next();
});

router.get('/',(req,res)=>{
	Category.find({}).then(categories => {
		console.log('categories',categories);
		res.render('admin/categories/index', {categories});
	});
});

router.post('/create',(req,res)=>{
	Category.findOne({name:req.body.name}).then(category=>{
		console.log('category',category)
		if(category==null){
			const categories = new Category({
				name: req.body.name
			});
			categories.save().then(savedCategory =>{
				console.log('savedCategory',savedCategory);
				req.flash('success_message', 'Category created !');
				res.redirect('/admin/categories');
			}).catch(err=>{
				console.log('err',err);
			});
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
		categories.save().then(savedCategory =>{
			req.flash("success_message","Category updated successfully !");
		    res.redirect('/admin/categories');
	    });
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



module.exports = router;