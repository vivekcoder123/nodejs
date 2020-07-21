const express = require('express');
const router = express.Router();
const Product = require('../../models/Product');
const Category = require('../../models/Category');
const Homepage = require('../../models/Homepage');
const User = require('../../models/User');
const Room = require('../../models/Room');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { route } = require('../admin');
const LocalStrategy = require('passport-local').Strategy;
const Cart = require('../../config/Cart');
const PaypalConfig = require('../../config/config');
const Report = require('../../models/Report');
const Order = require('../../models/Order');
const Comment = require('../../models/Comment');


router.all('/*',(req,res,next)=>{
	req.app.locals.layout = 'home';
	next();
});


router.get('/', async (req, res)=>{
    const headerCategories=await Category.aggregate([{$lookup:{from:"subcategories",localField:"_id",foreignField:"category",as:"subcat"}},{$sort:{created_at:-1}}]);
    const dotdProducts=await Product.find({show_in_deals_of_day:true,status:"publish"})
                     .limit(10).sort({created_at:-1})
                     .select({slug:1,name:1,images:1,price:1,discount:1,final_price:1,quantity:1});
    const menuCategories = await Category.aggregate([
        {$project: {name: 1, image: 1, slug: 1, sequence: 1, nullSequence: {$ifNull: ["$sequence", Number.MAX_VALUE]}}},
        {$sort: {"nullSequence": 1, created_at: 1}}
    ]);
    let arrayCats=[];
    menuCategories.slice(0, 4).forEach(cat=>{
        arrayCats.push(cat._id);
    });
    const allCategoriesWithProducts=await Product.aggregate([{$match:{category:{$in:arrayCats},status:"publish"}},
        {$lookup:{from:"categories",localField:"category",foreignField:"_id",as:"cat"}},{$sort:{created_at:-1}}])
        .group({_id:{category_id:'$category'},products:{$push:{name:"$name",_id:"$_id",slug:"$slug",images:"$images",price:"$price",discount:"$discount",final_price:"$final_price"}},category:{$addToSet:"$cat"}})
        .project({products:{$slice:['$products',10]},category:{$arrayElemAt:[{$arrayElemAt:["$category",0]},0]},_id:0});

    const rooms=await Room.find({});
    const newArrivals=await Product.find({status:"publish"}).sort({created_at:-1}).limit(8)
                        .select({slug:1,name:1,images:1,price:1,discount:1,final_price:1});
    let homepage=await Homepage.findOne({type:'homepage'});
    let metaData=[];
    metaData.title="Postidal: Online Shopping for Electronics, Furniture ...";
    metaData.keywords="shopping,ecommerce platform,ecommerce store,ecommerce multi vendor,marketplace multi vendor,seller marketplace";
    metaData.description="Free delivery on millions of items with Gold Membership. Very low prices on top brands, books, furniture, Clothes, electronics, computers, software, apparel ...";
    res.render('home/index',{metaData,dotdProducts,allCategoriesWithProducts,rooms,newArrivals,homepage,headerCategories,menuCategories});
});


router.get('/my-account',async (req,res)=>{
    if(res.locals.user){
        return res.redirect('/dashboard');
    }
    const headerCategories=await Category.aggregate([{$lookup:{from:"subcategories",localField:"_id",foreignField:"category",as:"subcat"}},{$sort:{created_at:-1}}]);
    const menuCategories = await Category.aggregate([
        {$project: {name: 1, image: 1, slug: 1, sequence: 1, nullSequence: {$ifNull: ["$sequence", Number.MAX_VALUE]}}},
        {$sort: {"nullSequence": 1, created_at: 1}}
    ]);
    let metaData=[];
    metaData.title="Postidal Sign In";
    metaData.keywords="shopping,ecommerce platform,ecommerce store,ecommerce multi vendor,marketplace multi vendor,seller marketplace";
    metaData.description="Hello Welcome to Your Postidal Log In. Use your email or username, or continue ...";
	res.render('home/my-account',{metaData,headerCategories, menuCategories});
});

router.get('/dashboard',async (req,res)=>{
    if(!res.locals.user){
        //return res.redirect('/my-account');
    }
    const headerCategories=await Category.aggregate([{$lookup:{from:"subcategories",localField:"_id",foreignField:"category",as:"subcat"}},{$sort:{created_at:-1}}]);
    const menuCategories = await Category.aggregate([
        {$project: {name: 1, image: 1, slug: 1, sequence: 1, nullSequence: {$ifNull: ["$sequence", Number.MAX_VALUE]}}},
        {$sort: {"nullSequence": 1, created_at: 1}}
    ]);
    let metaData=[];
    metaData.title="User Dashboard";
    metaData.keywords="shopping,ecommerce platform,ecommerce store,ecommerce multi vendor,marketplace multi vendor,seller marketplace";
    metaData.description="Hello Welcome to Your Dashboard";
	res.render('home/dashboard',{metaData,headerCategories, menuCategories});
});

router.get('/my-profile',async (req,res)=>{

    if(!res.locals.user){
        return res.redirect('/my-account');
    }
    const headerCategories=await Category.aggregate([{$lookup:{from:"subcategories",localField:"_id",foreignField:"category",as:"subcat"}},{$sort:{created_at:-1}}]);
    const menuCategories = await Category.aggregate([
        {$project: {name: 1, image: 1, slug: 1, sequence: 1, nullSequence: {$ifNull: ["$sequence", Number.MAX_VALUE]}}},
        {$sort: {"nullSequence": 1, created_at: 1}}
    ]);
    let metaData=[];
    metaData.title="User Profile";
    metaData.keywords="shopping,ecommerce platform,ecommerce store,ecommerce multi vendor,marketplace multi vendor,seller marketplace";
    metaData.description="Hello Welcome to Your Profile";
	res.render('home/profile',{metaData,headerCategories, menuCategories});

});

router.get('/my-orders',async (req,res)=>{

    if(!res.locals.user){
        return res.redirect('/my-account');
    }
    user_id=res.locals.user._id;
    const headerCategories=await Category.aggregate([{$lookup:{from:"subcategories",localField:"_id",foreignField:"category",as:"subcat"}},{$sort:{created_at:-1}}]);
    const menuCategories = await Category.aggregate([
        {$project: {name: 1, image: 1, slug: 1, sequence: 1, nullSequence: {$ifNull: ["$sequence", Number.MAX_VALUE]}}},
        {$sort: {"nullSequence": 1, created_at: 1}}
    ]);
    let metaData=[];
    metaData.title="User Orders";
    metaData.keywords="shopping,ecommerce platform,ecommerce store,ecommerce multi vendor,marketplace multi vendor,seller marketplace";
    metaData.description="Hello Welcome to Your Orders";
    const orders=await Report.find({user_id}).populate('product_id');
	res.render('home/orders',{metaData,headerCategories,orders, menuCategories});

});

router.get('/product/:slug',async (req,res)=>{
    const product=await Product.findOne({slug:req.params.slug}).populate('category').populate('subcategory');
    const relatedProducts=await Product.find({category:product.category}).select({slug:1,name:1,images:1,price:1,final_price:1}).where('_id').ne(product._id).sort({created_at:-1}).limit(10);
    const sameBrandProducts=await Product.find({brand:product.brand}).select({slug:1,name:1,images:1,price:1,final_price:1}).where('_id').ne(product._id).sort({created_at:-1}).limit(2);
    const headerCategories=await Category.aggregate([{$lookup:{from:"subcategories",localField:"_id",foreignField:"category",as:"subcat"}},{$sort:{created_at:-1}}]);
    const menuCategories = await Category.aggregate([
        {$project: {name: 1, image: 1, slug: 1, sequence: 1, nullSequence: {$ifNull: ["$sequence", Number.MAX_VALUE]}}},
        {$sort: {"nullSequence": 1, created_at: 1}}
    ]);
    let metaData=[];
    metaData.title=product.name;
    metaData.keywords="shopping,ecommerce platform,ecommerce store,ecommerce multi vendor,marketplace multi vendor,seller marketplace";
    metaData.description=product.description.replace(/<(.|\n)*?>/g, '');
    metaData.description=metaData.description.replace(/&nbsp;/g,' ');
    let reviews=await Comment.aggregate([{$match:{product_id:product._id}}]).group({_id:"$product_id",count:{$sum:1},average:{$avg:"$rating"}});
    reviews=reviews[0];
    req.session.redirectUrl=`/product/${req.params.slug}`;
    const averageRatings=await Comment.aggregate([{$match:{product_id:product._id}}]).group({_id:{rating:'$rating',count:{$sum:1}}});
	res.render('home/product-detail',{metaData,product,relatedProducts,sameBrandProducts,headerCategories,reviews,averageRatings, menuCategories});
});

router.post('/submit_review',async (req,res)=>{
    const rating=req.body.rating;
    const comment=req.body.comment;
    const product_id=req.body.product_id;
    const user=req.body.user_id;
    const product_slug=req.body.product_slug;
    Comment.findOne({user,product_id}).then(userReview=>{
        if(userReview){
            req.flash("error_message","You have already submitted review for this product");
            return res.redirect(`/product/${product_slug}`);
        }else{
            const review=new Comment({
                rating,
                comment,
                product_id,
                user
            });
            review.save().then(savedReview=>{
                req.flash("success_message","Your review has been submitted successfully");
                return res.redirect(`/product/${product_slug}`);
            });
        }
    });
});

router.get('/cart',async (req,res)=>{
    const headerCategories=await Category.aggregate([{$lookup:{from:"subcategories",localField:"_id",foreignField:"category",as:"subcat"}},{$sort:{created_at:-1}}]);
    const menuCategories = await Category.aggregate([
        {$project: {name: 1, image: 1, slug: 1, sequence: 1, nullSequence: {$ifNull: ["$sequence", Number.MAX_VALUE]}}},
        {$sort: {"nullSequence": 1, created_at: 1}}
    ]);
    let sess = req.session;
    let cart = (typeof sess.cart !== 'undefined') ? sess.cart : false;
    let metaData=[];
    metaData.title="Your Cart";
    metaData.keywords="shopping,ecommerce platform,ecommerce store,ecommerce multi vendor,marketplace multi vendor,seller marketplace";
    metaData.description="Your cart is ready , please click on buy now to book these items";
    console.log('cart',cart);
    res.render('home/cart',{metaData,cart,headerCategories, menuCategories});
});

router.post('/cart',(req,res)=>{
    let qty = parseInt(req.body.qty, 10);
    let product = req.body._id;
    if(qty > 0) {
        Product.findOne({_id: product}).then(prod => {
            let cart = (req.session.cart) ? req.session.cart : null;
            Cart.addToCart(prod, qty, cart);
            if(req.body.buttonClicked){
                return res.redirect('/checkout');
            }
            req.flash("success_message","Product is added to the cart successfully !");
            return res.redirect('/cart');
        }).catch(err => {
            console.log('err',err);
           res.redirect('/');
        });
    } else {
        res.redirect('/');
    }
});

router.post('/cart/remove/:id',(req,res)=>{
    const id = req.params.id;
    Cart.removeFromCart(id, req.session.cart);
    req.flash("error_message","Product is removed from the cart !");
    res.redirect('/cart');
});

router.post('/cart/empty',(req,res)=>{
    Cart.emptyCart(req);
    req.flash("error_message","All products are removed from the cart !");
    res.redirect('/cart');
});

router.post('/cart/update/:id',(req,res)=>{
    const product_id=req.params.id;
    const qty=req.body.qty;
    Cart.updateProductQuantity(product_id,qty,req.session.cart);
    req.flash("success_message","Cart is updated successfully !");
    res.redirect('/cart');
});

router.get('/checkout',async (req,res)=>{
    if(!res.locals.user){
        req.session.redirectUrl="/checkout";
        return res.redirect('/my-account');
    }
    let cart = (req.session.cart) ? req.session.cart : null;
    console.log('cart',cart);
    const headerCategories=await Category.aggregate([{$lookup:{from:"subcategories",localField:"_id",foreignField:"category",as:"subcat"}},{$sort:{created_at:-1}}]);
    const menuCategories = await Category.aggregate([
        {$project: {name: 1, image: 1, slug: 1, sequence: 1, nullSequence: {$ifNull: ["$sequence", Number.MAX_VALUE]}}},
        {$sort: {"nullSequence": 1, created_at: 1}}
    ]);
    let metaData=[];
    metaData.title="Checkout Page";
    metaData.keywords="shopping,ecommerce platform,ecommerce store,ecommerce multi vendor,marketplace multi vendor,seller marketplace";
    metaData.description="Checkout to buy the items you have in your cart";
    res.render('home/checkout',{metaData,PaypalConfig,headerCategories,cart, menuCategories});
});

router.get('/shop/categories',async (req,res)=>{
    const headerCategories=await Category.aggregate([{$lookup:{from:"subcategories",localField:"_id",foreignField:"category",as:"subcat"}},{$sort:{created_at:-1}}]);
    const menuCategories = await Category.aggregate([
        {$project: {name: 1, image: 1, slug: 1, sequence: 1, nullSequence: {$ifNull: ["$sequence", Number.MAX_VALUE]}}},
        {$sort: {"nullSequence": 1, created_at: 1}}
    ]);
    // const categories=await Category.find({},{name:1,image:1}).sort({created_at:1}).select({_id:1});
    // let arrayCats=[];
    // categories.forEach(cat=>{
    //     arrayCats.push(cat._id);
    // });
    // const allCategoriesWithProducts=await Product.aggregate([{$match:{category:{$in:arrayCats},status:"publish"}},
    //     {$lookup:{from:"categories",localField:"category",foreignField:"_id",as:"cat"}},{$sort:{created_at:-1}}])
    //     .group({_id:{category_id:'$category'},products:{$push:{name:"$name",_id:"$_id",slug:"$slug",images:"$images",price:"$price",discount:"$discount",final_price:"$final_price"}},category:{$addToSet:"$cat"}})
    //     .project({products:{$slice:['$products',10]},category:{$arrayElemAt:[{$arrayElemAt:["$category",0]},0]},_id:0});
    let metaData=[];
    metaData.title="Shop By Category";
    metaData.keywords="shopping,ecommerce platform,ecommerce store,ecommerce multi vendor,marketplace multi vendor,seller marketplace";
    metaData.description="Shop by department, purchase cars, fashion apparel ...";
    res.render('home/shop-categories',{metaData,headerCategories, menuCategories});
});

router.get('/shop',async (req,res)=>{
    const headerCategories=await Category.aggregate([{$lookup:{from:"subcategories",localField:"_id",foreignField:"category",as:"subcat"}},{$sort:{created_at:-1}}]);
    const menuCategories = await Category.aggregate([
        {$project: {name: 1, image: 1, slug: 1, sequence: 1, nullSequence: {$ifNull: ["$sequence", Number.MAX_VALUE]}}},
        {$sort: {"nullSequence": 1, created_at: 1}}
    ]);

    let page=req.query.page;
    if(!page){
        page=1;
    }
    let queryParams=``;
    for (const key in req.query) {
        if(key!="page")
            queryParams+=`&${key}=${req.query[key]}`;
    }
    let sortKey="created_at";
    let sortValue=-1;
    let sortConditions={};
    if(req.query.sortKey){
        sortKey=req.query.sortKey;
    }
    if(req.query.sortValue){
        sortValue=req.query.sortValue;
    }
    const sorting=`sortKey=${sortKey}&sortValue=${sortValue}`;
    sortConditions[sortKey]=sortValue;
    let conditions={"status":"publish"};
    if(req.query.subcategory && req.query.subcategory!=""){
        conditions['subcategory']=req.query.subcategory;
    }
    if(req.query.category && req.query.category!=""){
        conditions['category']=req.query.category;
    }
    if(req.query.brands && req.query.brands!=""){
        conditions['brands']={$in:req.query.brands};
    }
    if(req.query.price && req.query.price!=""){
        conditions['price']={$range:req.query.price}
    }
    let searchValue="";
    if(req.query.search && req.query.search!=""){
        conditions['slug']={ $regex : req.query.search.toLowerCase() };
        searchValue=req.query.search;
    }
    if(req.query.tag && req.query.tag!=""){
        conditions['tags']={$in:[req.query.tag]};
    }
    if(req.query.room && req.query.room!=""){
        conditions['room']=req.query.room;
    }
    const brands=await Product.aggregate([{$match:{status:"publish"}}]).group({_id:{name:'$brand',count:{$sum:1}}});
    let brandsData=[];
    brands.forEach(brand=>{
        if(brand._id.name && brand._id.count){
            let brandSingle={};
            brandSingle['name']=brand._id.name;
            brandSingle['count']=brand._id.count;
            brandsData.push(brandSingle);
        }
    });
    const countProducts=await Product.countDocuments(conditions);
    const rooms=await Room.find({});
	Product.paginate(conditions, { page, limit: 12,populate:['category','subcategory'],sort:sortConditions }).then(response=>{
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
		pagination+=`<ul class="pagination"><li><a href="/shop?page=${previous_page}${queryParams}">Previous</a></li>`;
		for(let i=1;i<=totalPages;i++){
			if(i==current_page){
				pagination+=`<li class="active"><a href="/shop?page=${i}${queryParams}">${i}</a></li>`;
			}else{
				pagination+=`<li><a href="/shop?page=${i}${queryParams}">${i}</a></li>`;
			}
		}
		pagination+=`<li><a href="/shop?page=${next_page}${queryParams}">Next</a></li></ul>`;
        let metaData=[];
        metaData.title="Daily Deals";
        metaData.keywords="shopping,ecommerce platform,ecommerce store,ecommerce multi vendor,marketplace multi vendor,seller marketplace";
        metaData.description="Save money on the Best Deals online on Postidal Daily Deals….";
        res.render('home/all-products',{metaData,headerCategories,products,pagination,countProducts,brandsData,sorting,searchValue,rooms, menuCategories});
	});

});

router.get('/category/:slug',async (req,res)=>{
    const headerCategories=await Category.aggregate([{$lookup:{from:"subcategories",localField:"_id",foreignField:"category",as:"subcat"}},{$sort:{created_at:-1}}]);
    const menuCategories = await Category.aggregate([
        {$project: {name: 1, image: 1, slug: 1, sequence: 1, nullSequence: {$ifNull: ["$sequence", Number.MAX_VALUE]}}},
        {$sort: {"nullSequence": 1, created_at: 1}}
    ]);
    let page=req.query.page;
    if(!page){
        page=1;
    }
    const category=await Category.findOne({slug:req.params.slug})
    let metaData=[];
    metaData.title=category.name;
    metaData.keywords="shopping,ecommerce platform,ecommerce store,ecommerce multi vendor,marketplace multi vendor,seller marketplace";
    metaData.description=`Get the best deals on ${category.name} when you shop the largest ...`;
    const products=Product.paginate({category:category._id,status:"publish"},{ page, limit: 20,sort:{created_at:-1}}).then(response=>{

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
		pagination+=`<ul class="pagination"><li><a href="/category/${req.params.slug}?page=${previous_page}">Previous</a></li>`;
		for(let i=1;i<=totalPages;i++){
			if(i==current_page){
				pagination+=`<li class="active"><a href="/category/${req.params.slug}?page=${i}">${i}</a></li>`;
			}else{
				pagination+=`<li><a href="/category/${req.params.slug}?page=${i}">${i}</a></li>`;
			}
		}
		pagination+=`<li><a href="/category/${req.params.slug}?page=${next_page}">Next</a></li></ul>`;
        res.render('home/category-detail',{metaData,category,products,pagination,headerCategories, menuCategories});

    });
});

router.get('/room/:slug',async (req,res)=>{
    const headerCategories=await Category.aggregate([{$lookup:{from:"subcategories",localField:"_id",foreignField:"category",as:"subcat"}},{$sort:{created_at:-1}}]);
    let page=req.query.page;
    if(!page){
        page=1;
    }
    const room=await Room.findOne({slug:req.params.slug})
    let metaData=[];
    metaData.title=room.name;
    metaData.keywords="shopping,ecommerce platform,ecommerce store,ecommerce multi vendor,marketplace multi vendor,seller marketplace";
    metaData.description=`Shop By Room`;
    const products=Product.paginate({room:room._id,status:"publish"},{ page, limit: 20,sort:{created_at:-1}}).then(response=>{

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
		pagination+=`<ul class="pagination"><li><a href="/room/${req.params.slug}?page=${previous_page}">Previous</a></li>`;
		for(let i=1;i<=totalPages;i++){
			if(i==current_page){
				pagination+=`<li class="active"><a href="/room/${req.params.slug}?page=${i}">${i}</a></li>`;
			}else{
				pagination+=`<li><a href="/room/${req.params.slug}?page=${i}">${i}</a></li>`;
			}
		}
		pagination+=`<li><a href="/room/${req.params.slug}?page=${next_page}">Next</a></li></ul>`;
        res.render('home/room-detail',{metaData,room,products,pagination,headerCategories, menuCategories});

    });
});

// router.get('/about-us',async (req,res)=>{
//     const headerCategories=await Category.aggregate([{$lookup:{from:"subcategories",localField:"_id",foreignField:"category",as:"subcat"}},{$sort:{created_at:-1}}]);
//     let metaData=[];
//     metaData.title="About Us";
//     metaData.keywords="shopping,ecommerce platform,ecommerce store,ecommerce multi vendor,marketplace multi vendor,seller marketplace";
//     metaData.description="We connect millions of buyers and sellers around the world, empowering people & creating economic opportunity for all.";
//     res.render('home/about-us',{metaData,headerCategories});
// });

router.get('/contact-us',async (req,res)=>{
    const headerCategories=await Category.aggregate([{$lookup:{from:"subcategories",localField:"_id",foreignField:"category",as:"subcat"}},{$sort:{created_at:-1}}]);
    const menuCategories = await Category.aggregate([
        {$project: {name: 1, image: 1, slug: 1, sequence: 1, nullSequence: {$ifNull: ["$sequence", Number.MAX_VALUE]}}},
        {$sort: {"nullSequence": 1, created_at: 1}}
    ]);
    let metaData=[];
    metaData.title="Contact Us";
    metaData.keywords="shopping,ecommerce platform,ecommerce store,ecommerce multi vendor,marketplace multi vendor,seller marketplace";
    metaData.description="Contact Us For Any Questions";
    res.render('home/contact-us',{metaData,headerCategories, menuCategories});
});

// router.get('/faq',async (req,res)=>{
//     const headerCategories=await Category.aggregate([{$lookup:{from:"subcategories",localField:"_id",foreignField:"category",as:"subcat"}},{$sort:{created_at:-1}}]);
//     let metaData=[];
//     metaData.title="FAQ";
//     metaData.keywords="shopping,ecommerce platform,ecommerce store,ecommerce multi vendor,marketplace multi vendor,seller marketplace";
//     metaData.description="Frequently Asked Questions";
//     res.render('home/faq',{metaData,headerCategories});
// });

router.get('/privacy-policy',async (req,res)=>{
    const headerCategories=await Category.aggregate([{$lookup:{from:"subcategories",localField:"_id",foreignField:"category",as:"subcat"}},{$sort:{created_at:-1}}]);
    const menuCategories = await Category.aggregate([
        {$project: {name: 1, image: 1, slug: 1, sequence: 1, nullSequence: {$ifNull: ["$sequence", Number.MAX_VALUE]}}},
        {$sort: {"nullSequence": 1, created_at: 1}}
    ]);
    let metaData=[];
    metaData.title="Privacy Policy";
    metaData.keywords="shopping,ecommerce platform,ecommerce store,ecommerce multi vendor,marketplace multi vendor,seller marketplace";
    metaData.description="Privacy Policy";
    res.render('home/privacy-policy',{metaData,headerCategories, menuCategories});
});

router.get('/cookie-policy',async (req,res)=>{
    const headerCategories=await Category.aggregate([{$lookup:{from:"subcategories",localField:"_id",foreignField:"category",as:"subcat"}},{$sort:{created_at:-1}}]);
    const menuCategories = await Category.aggregate([
        {$project: {name: 1, image: 1, slug: 1, sequence: 1, nullSequence: {$ifNull: ["$sequence", Number.MAX_VALUE]}}},
        {$sort: {"nullSequence": 1, created_at: 1}}
    ]);
    let metaData=[];
    metaData.title="Cookie Policy";
    metaData.keywords="shopping,ecommerce platform,ecommerce store,ecommerce multi vendor,marketplace multi vendor,seller marketplace";
    metaData.description="Cookie Policy";
    res.render('home/cookie-policy',{metaData,headerCategories, menuCategories});
});

router.get('/return-policy',async (req,res)=>{
    const headerCategories=await Category.aggregate([{$lookup:{from:"subcategories",localField:"_id",foreignField:"category",as:"subcat"}},{$sort:{created_at:-1}}]);
    const menuCategories = await Category.aggregate([
        {$project: {name: 1, image: 1, slug: 1, sequence: 1, nullSequence: {$ifNull: ["$sequence", Number.MAX_VALUE]}}},
        {$sort: {"nullSequence": 1, created_at: 1}}
    ]);
    let metaData=[];
    metaData.title="Return Policy";
    metaData.keywords="shopping,ecommerce platform,ecommerce store,ecommerce multi vendor,marketplace multi vendor,seller marketplace";
    metaData.description="Return Policy";
    res.render('home/return-policy',{metaData,headerCategories, menuCategories});
});

router.get('/terms-and-conditions',async (req,res)=>{
    const headerCategories=await Category.aggregate([{$lookup:{from:"subcategories",localField:"_id",foreignField:"category",as:"subcat"}},{$sort:{created_at:-1}}]);
    const menuCategories = await Category.aggregate([
        {$project: {name: 1, image: 1, slug: 1, sequence: 1, nullSequence: {$ifNull: ["$sequence", Number.MAX_VALUE]}}},
        {$sort: {"nullSequence": 1, created_at: 1}}
    ]);
    let metaData=[];
    metaData.title="Terms and Conditions";
    metaData.keywords="shopping,ecommerce platform,ecommerce store,ecommerce multi vendor,marketplace multi vendor,seller marketplace";
    metaData.description="Terms and Conditions";
    res.render('home/terms-and-conditions',{metaData,headerCategories, menuCategories});
});

// APP LOGIN

passport.use(new LocalStrategy({usernameField: 'email',passReqToCallback:true}, (req,email, password, done)=>{
    User.findOne({email: email}).then(user=>{
        if(!user) {
            req.flash("error_message","Please enter correct credentials !");
            return done(null, false);
        }
        bcrypt.compare(password, user.password, (err, matched)=>{
            if(err) return err;
            if(matched){
                req.flash("success_message","You have logged in successfully !");
                return done(null, user);
            } else {
                req.flash("error_message","Please enter correct credentials !");
                return done(null, false);
            }
        });
    });
}));


passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});


router.post('/login', (req, res, next)=>{
    let successRedirect='/dashboard';
    if(req.session.redirectUrl && req.session.redirectUrl!=null){
     successRedirect=req.session.redirectUrl;
     req.session.redirectUrl=null;
    }
    passport.authenticate('local', {
        successRedirect: successRedirect,
        failureRedirect: '/my-account'
    })(req, res, next);
});

router.get('/logout', (req, res)=>{
    req.logOut();
    res.redirect('/my-account');
});


router.post('/register', (req, res)=>{
    User.findOne({email: req.body.email}).then(user=>{
        if(!user){
            const newUser = new User({
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                email: req.body.email,
                password: req.body.password,
                gender:req.body.gender,
                city:req.body.city,
                country:req.body.country,
                phone:req.body.phone,
                address:req.body.address
            });
            bcrypt.genSalt(10, (err, salt)=>{
                bcrypt.hash(newUser.password, salt, (err, hash)=>{
                    newUser.password = hash;
                    newUser.save().then(savedUser=>{
                        req.flash('success_message', 'You have been registered successfully, please login !')
                        res.redirect('/my-account');
                    });
                })
            });
        } else {
            req.flash('error_message', 'That email already exists, please login !');
            res.redirect('/my-account');
        }
    });
});

router.post('/save_profile', (req, res)=>{
    User.findOne({_id: req.body.user_id}).then(user=>{
        if(user){
                user.first_name= req.body.first_name,
                user.last_name= req.body.last_name,
                user.email= req.body.email,
                user.gender=req.body.gender,
                user.city=req.body.city,
                user.country=req.body.country,
                user.phone=req.body.phone,
                user.address=req.body.address
                user.save().then(savedUser=>{
                    req.flash('success_message', 'You profile has been updated successfully !')
                    return res.redirect('/dashboard');
                });
        }
    });
});

router.post('/get_order_id',(req,res)=>{
    const first_name=req.body.first_name;
    const last_name=req.body.last_name;
    const user_id=req.body.user_id;
    const email=req.body.email;
    const country=req.body.country;
    const phone=req.body.phone;
    const address=req.body.address;
    const order_notes=req.body.order_notes;
    const payment_status="started";
    const order=new Order({
        first_name,
        last_name,
        user_id,
        email,
        country,
        phone,
        address,
        order_notes,
        payment_status
    });
    order.save().then(order=>{
        const cart=req.session.cart;
        if(cart && cart.items.length>0){
            cart.items.forEach(async (item) => {
                const product_price = item.price;
                const shipping_price = item.shipping_price;
                const product_name=item.title;
                const product_quantity = item.qty;
                const order_id=order._id;
                const product_id=item.id;
                const order_status="Waiting For Payment";
                const report=new Report({
                    product_price,
                    product_name,
                    product_quantity,
                    order_id,
                    product_id,
                    shipping_price,
                    order_status,
                    user_id
                });
                const save=await report.save();
            });
        }
        res.send(order._id);

    });
});

router.get('/payment_callback',async (req,res)=>{
    const headerCategories=await Category.aggregate([{$lookup:{from:"subcategories",localField:"_id",foreignField:"category",as:"subcat"}},{$sort:{created_at:-1}}]);
    const menuCategories = await Category.aggregate([
        {$project: {name: 1, image: 1, slug: 1, sequence: 1, nullSequence: {$ifNull: ["$sequence", Number.MAX_VALUE]}}},
        {$sort: {"nullSequence": 1, created_at: 1}}
    ]);
    let metaData=[];
    metaData.title="Order Summary";
    metaData.keywords="shopping,ecommerce platform,ecommerce store,ecommerce multi vendor,marketplace multi vendor,seller marketplace";
    metaData.description="Order Summary";
    if(req.query.tx && req.query.st && req.query.cm){
        const order_id=req.query.cm;
        Order.findOne({_id:order_id}).then(order=>{
            if(order.payment_status!="started"){
                return res.redirect('/shop');
            }
            order.payment_status=req.query.st;
            order.paypal_transaction_id=req.query.tx;
            order.save().then(savedOrder=>{
                const reportStatus=`Payment ${savedOrder.payment_status}`;
                Report.find({order_id}).updateMany({order_status:reportStatus}).then(reports=>{
                    req.session.cart = {
                        items: [],
                        totals: 0.00,
                        withoutShippingTotals: 0.00,
                        formattedTotals: ''
                    };
                    res.render('home/payment_status',{headerCategories,metaData,savedOrder, menuCategories});
                });
            })
        });
    }else{
        req.flash("error_message","Some Error Occured ! Please try again");
        return res.redirect("/checkout");
    }
});

module.exports = router;
