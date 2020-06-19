const express = require('express');
const router = express.Router();
const Product = require('../../models/Product');
const Category = require('../../models/Category');
const SubCategory = require('../../models/SubCategory');
const fs = require('fs');
const { isEmpty } = require('../../helpers/upload-helper');
const {userAuthenticated} = require('../../helpers/authentication');
const cloudinary=require('../../config/cloudinary').cloud;

router.all('/*', userAuthenticated,(req,res,next)=>{
	req.app.locals.layout = 'admin';
	next();
});

router.get('/add',(req,res)=>{
	Category.find({}).then(categories => {
		res.render('admin/products/create',{categories: categories});
	});
});

 
router.get('/view/:page', (req, res)=>{
	let page=req.params.page;
	Product.paginate({}, { page, limit: 10,populate:['category','subcategory'],sort:{created_at:-1} }).then(response=>{
		const products=response.docs;
		const current_page=parseInt(response.page);
		const totalPages=parseInt(response.pages);
		let previous_page=current_page-1;
		let next_page=current_page+1;
		if(previous_page<1){
			previous_page=1;
		}
		if(next_page>totalPages){
			next_page=totalPages;
		}
		let pagination="";
		pagination+=`<ul class="pagination text-center"><li class="page-item"><a class="page-link" href="/admin/products/view/${previous_page}">Previous</a></li>`;
		for(let i=1;i<=totalPages;i++){
			if(i==current_page){
				pagination+=`<li class="page-item active"><a class="page-link" href="/admin/products/view/${i}">${i}</a></li>`;
			}else{
				pagination+=`<li class="page-item"><a class="page-link" href="/admin/products/view/${i}">${i}</a></li>`;
			}
		}			
		pagination+=`<li class="page-item"><a class="page-link" href="/admin/products/view/${next_page}">Next</a></li></ul>`;
		res.render('admin/products/index', {products,pagination});
	});
});


router.post('/create',async (req,res)=>{

	const category=req.body.category;
	const subcategory=req.body.subcategory;
	const price=req.body.price;
	const quantity=req.body.quantity;
	const discount=req.body.discount;
	const name=req.body.name;
	const status=req.body.status;
	const description=req.body.hidden_description;
	let specifications=[];
	let mainPoints=[];
	if(req.body.hidden_specs && req.body.hidden_specs!=""){
		specifications=JSON.parse(req.body.hidden_specs);
	}
	if(req.body.hidden_main_point && req.body.hidden_main_point!=""){
		mainPoints=JSON.parse(req.body.hidden_main_point);
	}
	const vendor=req.body.vendor;
	const tags=req.body.tags.split(",");
	let images=[];
	if(typeof req.files.images.length !="undefined"){

		for(const image of req.files.images){
			const cloudRes=await cloudinary.uploader.upload(image.tempFilePath,{quality:"auto",format:"webp"});
			images.push(cloudRes.secure_url);
		}

	}else{

		const cloudRes=await cloudinary.uploader.upload(req.files.images.tempFilePath,{quality:"auto",format:"webp"});
		images.push(cloudRes.secure_url);
	}
	const product = new Product({
		category,
		subcategory,
		price,
		discount,
		quantity,
		name,
		status,
		description,
		specifications,
		mainPoints,
		vendor,
		tags,
		images
	});
	product.save().then(savedproduct=>{		
		req.flash('success_message', `product ${savedproduct.name} was CREATED succesfully`);	
		res.redirect('/admin/products/add');
	}).catch(err=>{
		console.log('err',err);
	});

});

router.get('/edit/:id',(req,res) =>{
	Product.findOne({_id:req.params.id}).then(product=>{
		let specsArray=[];
		let mainPointsArray=[];
		product.specifications.forEach(sp=>{
			specsArray.push(sp);
		});
		product.mainPoints.forEach(mp=>{
			mainPointsArray.push(mp);
		});
		product.specifications=JSON.stringify(specsArray);
		product.mainPoints=JSON.stringify(mainPointsArray);
		Category.find({}).then(categories => {
			SubCategory.find({}).then(subcategories=>{
				res.render('admin/products/edit',{product,categories,subcategories});
			});
		});
	});
});

router.put('/edit/:id',async (req,res) =>{
	Product.findOne({_id:req.params.id}).then(async(product)=>{
		product.category=req.body.category;
		product.subcategory=req.body.subcategory;
		product.price=req.body.price;
		product.discount=req.body.discount;
		product.quantity=req.body.quantity;
		product.name=req.body.name;
		product.status=req.body.status;
		product.description=req.body.hidden_description;
		if(req.body.hidden_specs && req.body.hidden_specs!=""){
			product.specifications=JSON.parse(req.body.hidden_specs);
		}
		if(req.body.hidden_main_point && req.body.hidden_main_point!=""){
			product.mainPoints=JSON.parse(req.body.hidden_main_point);
		}
		product.vendor=req.body.vendor;
		product.tags=req.body.tags.split(",");
		if(req.files.images.size!=0){
			let images=[];
			if(typeof req.files.images.length !="undefined"){

				for(const image of req.files.images){
					const cloudRes=await cloudinary.uploader.upload(image.tempFilePath,{quality:"auto",format:"webp"});
					images.push(cloudRes.secure_url);
				}
	
			}else{
	
				const cloudRes=await cloudinary.uploader.upload(req.files.images.tempFilePath,{quality:"auto",format:"webp"});
				images.push(cloudRes.secure_url);
			}
			product.images=images;
		}
		product.save().then(savedproduct=>{		
			req.flash('success_message', `product ${savedproduct.name} was updated succesfully`);	
			res.redirect('/admin/products/view/1');
		}).catch(err=>{
			console.log('err',err);
		});	
	});
});

router.delete('/:id', (req, res)=>{

    Product.deleteOne({_id: req.params.id})
        .then(product =>{ 
            req.flash('success_message', `Product was successfully deleted`);
			res.redirect('/admin/products/view/1');
     });
});





router.post('/like/:id',(req, res) => {

   
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
                toastr.success(`you have allready liked this post`);
                res.redirect(`/post/${post.slug}`);
          }

          // Add user id to likes array
          else{
          	post.likes.unshift({ user: req.user.id });

          post.save().then(post =>{
          	
          	res.send(post);
          	
          });
          }
          
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
    
  }
);

// @route   POST api/posts/unlike/:id
// @desc    Unlike post
// @access  Private
router.post(
  '/unlike/:id',
  
  (req, res) => {
   
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            	toastr.success(`you have already unliked this post`);
                res.redirect(`/post/${post.slug}`);
          }
          else{
          	// Get remove index
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          // Splice out of array
          post.likes.splice(removeIndex, 1);

          // Save
          post.save().then(post => {
          	
          	
          	
          	res.send(post);
          });
          }
          
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
   
  }
);

router.get('/update_deals_of_the_day/:action/:id',(req,res)=>{
	Product.findOne({_id:req.params.id}).then(product=>{
		if(req.params.action=="show"){
			product.show_in_deals_of_day=true;
		}else{
			product.show_in_deals_of_day=false;
		}
		product.save().then(product=>{
			req.flash('success_message', `Product ${product.name} was successfully updated`);
			res.redirect('/admin/products/view/1');
		});
	}).catch(err=>console.log('err',err));
});


module.exports = router;                               