const express = require('express');
const router = express.Router();
const Product = require('../../models/Product');
const Category = require('../../models/Category');
const fs = require('fs');
const { isEmpty } = require('../../helpers/upload-helper');
const {userAuthenticated} = require('../../helpers/authentication')


router.all('/*', userAuthenticated,(req,res,next)=>{
	req.app.locals.layout = 'admin';
	next();
});

router.get('/add',(req,res)=>{
	Category.find({}).then(categories => {
		res.render('admin/products/create',{categories: categories});
	});
});

 
router.get('/my-products', (req, res)=>{
    Post.find({user: req.user.id}).sort({date:-1})
        .populate('Category')
        .then(products=>{
            res.render('admin/products/my-products', {products: products});
        });
});


router.post('/create',(req,res)=>{

	let filename = 'Koala.jpg';

	if(!isEmpty(req.files)){
		let file = req.files.file;
		filename = Date.now()+'-'+file.name;
		file.mv('./public/uploads/'+filename,(err)=>{
			if(err) throw err;
		});
		
	}

	let allowComments = true;
	if(req.body.allowComments){
		allowComments = true;
	}else{
		allowComments = false;
	}

	const post = new Post({
		user:req.user.id,
		title: req.body.title,
		status: req.body.status,
		allowComments: allowComments,
		Category: req.body.category,
		body: req.body.body,
		file:filename
	});
	post.save().then(savedPost=>{		
		req.flash('success_message', `Post ${savedPost.title} was CREATED succesfully`);	
		res.redirect('/admin/posts/my-posts');

	});	
});

router.get('/edit/:id',(req,res) =>{
	Post.findOne({_id:req.params.id}).then(post=>{
		Category.find({}).then(categories => {
			res.render('admin/posts/edit',{post:post, categories: categories});
		});
	});
});

router.put('/edit/:id',(req,res) =>{
	Post.findOne({_id:req.params.id}).then(post=>{
		let allowComments = true;
			if(req.body.allowComments){
				allowComments = true;
			}else{
				allowComments = false;
			}
		post.user = req.user.id;
		post.title = req.body.title;
		post.status = req.body.status;
		post.allowComments = allowComments;
		post.Category = req.body.category;
		post.body = req.body.body;

		if(!isEmpty(req.files)){
			fs.unlink('./public/uploads/' + post.file, (err)=>{ console.log(err);
            });
			let file = req.files.file;
			filename = Date.now()+'-'+file.name;
			post.file = filename;
			file.mv('./public/uploads/'+filename,(err)=>{
				if(err) throw err;
			});
			
			
		}
		

		post.save().then(savedPost=>{
			if(savedPost){
				req.flash('success_message', `Post ${savedPost.title} was UPDATED succesfully`);
				res.redirect('/admin/posts/my-posts');
			}
		});		
	});
});

router.delete('/:id', (req, res)=>{

    Post.findOne({_id: req.params.id})
        .populate('comments')
        .then(post =>{ 
            fs.unlink('./public/uploads/' + post.file, (err)=>{

                if(!post.comments.length < 1){
                      post.comments.forEach(comment=>{
                      comment.remove();
                   });
                }
                post.remove().then(postRemoved=>{
                    req.flash('success_message', 'Post was successfully deleted');
                    res.redirect('/admin/posts/my-posts');
                });
            });
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




module.exports = router;                               