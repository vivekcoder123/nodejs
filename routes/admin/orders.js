const express = require('express');
const router = express.Router();
const Report = require('../../models/Report');
const {userAuthenticated} = require('../../helpers/authentication');
const User = require('../../models/User');

router.all('/*', userAuthenticated,(req,res,next)=>{
	req.app.locals.layout = 'admin';
	next();
});

router.get('/:page',(req,res)=>{
    let page=req.params.page;
    if(!page){
        page=1;
    }
	Report.paginate({},{page,limit:20,populate:['user_id'],sort:{created_at:-1}}).then(response => {
		const orders=response.docs;
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
		pagination+=`<ul class="pagination text-center"><li class="page-item"><a class="page-link" href="/admin/orders/${previous_page}">Previous</a></li>`;
		for(let i=1;i<=totalPages;i++){
			if(i==current_page){
				pagination+=`<li class="page-item active"><a class="page-link" href="/admin/orders/${i}">${i}</a></li>`;
			}else{
				pagination+=`<li class="page-item"><a class="page-link" href="/admin/orders/${i}">${i}</a></li>`;
			}
		}			
		pagination+=`<li class="page-item"><a class="page-link" href="/admin/orders/${next_page}">Next</a></li></ul>`;
		res.render('admin/orders/index', {orders,pagination});
	});
});

router.post('/update_status',(req,res)=>{
    const status=req.body.order_status;
    const report_id=req.body.report_id;
    Report.findOne({_id:report_id}).then(report=>{
        report.order_status=status;
        report.save().then(updatedReport=>{
            req.flash("success_message","Order status has been updated successfully");
            return res.redirect("/admin/orders/");
        });
    });
});

module.exports = router;