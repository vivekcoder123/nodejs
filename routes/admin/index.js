const express = require('express');
const router = express.Router();
const Product = require('../../models/Product');
const Category = require('../../models/Category');
const Comment = require('../../models/Comment');
const {userAuthenticated} = require('../../helpers/authentication')



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


module.exports = router;