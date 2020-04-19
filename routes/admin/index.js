const express = require('express');
const router = express.Router();
const {userAuthenticated} = require('../../helpers/authentication')



router.all('/*', userAuthenticated,(req,res,next)=>{
	req.app.locals.layout = 'admin';
	next();
});

router.get('/',(req,res)=>{
	res.render('admin/index');
});

router.get('/dashboard',(req,res)=>{
	res.render('admin/dashboard');
}); 


module.exports = router;