const express = require('express');
const router = express.Router();
const Room = require('../../models/Room');
const {userAuthenticated} = require('../../helpers/authentication');
const Product = require('../../models/Product');
const cloudinary=require('../../config/cloudinary').cloud;

router.all('/*', userAuthenticated,(req,res,next)=>{
	req.app.locals.layout = 'admin';
	next();
});

router.get('/',(req,res)=>{
	Room.find({}).then(rooms => {
		res.render('admin/rooms/index', {rooms});
	});
});

router.post('/create',(req,res)=>{
	Room.findOne({name:req.body.name}).then(room=>{
		if(room==null){
			if(req.files.image.size!=0){

				cloudinary.uploader.upload(req.files.image.tempFilePath,{quality:"auto",format:"png"}).then(result=>{
					const rooms = new Room({
						name: req.body.name,
						image:result.secure_url
					});
					rooms.save().then(savedRoom =>{
						req.flash('success_message', 'Room created !');
						res.redirect('/admin/rooms');
					}).catch(err=>{
						console.log('err',err);
					});
				}).catch(err=>{
					console.log('err',err)
				});

			}else{

				const rooms = new Room({
					name: req.body.name
				});
				rooms.save().then(savedRoom =>{
					req.flash('success_message', 'Room created !');
					res.redirect('/admin/rooms');
				}).catch(err=>{
					console.log('err',err);
				});

			}
			
		}else{
			req.flash('error_message', 'Room already exists !');
			res.redirect('/admin/rooms');
		}
	}).catch(err=>{
		console.log('err',err);
	});
	
});

router.get('/edit/:id',(req,res)=>{
	Room.findOne({_id:req.params.id}).then(rooms => {
		res.render('admin/rooms/edit', {rooms:rooms});
	});
});


router.put('/edit/:id',(req,res)=>{
	Room.findOne({_id:req.params.id}).then(rooms => {
		rooms.name = req.body.name;
		if(req.files.image.size!=0){
			cloudinary.uploader.upload(req.files.image.tempFilePath,{quality:"auto",format:"png"}).then(result=>{
				rooms.image=result.secure_url;
				rooms.save().then(savedRoom =>{
					req.flash("success_message","Room updated successfully !");
					res.redirect('/admin/rooms');
				});
			}).catch(err=>{
				console.log('err',err)
			});
		}else{
			rooms.save().then(savedRoom =>{
				req.flash("success_message","Room updated successfully !");
				res.redirect('/admin/rooms');
			});
		}
	});	
});

router.delete('/:id', (req,res) => {
	Room.deleteOne({_id:req.params.id})
	.then(room=>{			
		req.flash("success_message","Room deleted successfully !");
        res.redirect('/admin/rooms');
	});
});



module.exports = router;