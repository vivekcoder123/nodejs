const express = require('express');
const router = express.Router();
const SubCategory = require('../../models/SubCategory');
const {userAuthenticated} = require('../../helpers/authentication');
const Category = require('../../models/Category');



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
			const subcategory = new SubCategory({
                name: req.body.name,
                category: req.body.category
			});
			subcategory.save().then(savedSubCategory =>{
				req.flash('success_message', 'subcategory created !');
				res.redirect('/admin/subcategories');
			});
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
		subcategory.save().then(savedSubCategory =>{
			req.flash("success_message","subcategory updated successfully !");
		    res.redirect('/admin/subcategories');
	    });
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