const express = require('express');
const router = express.Router();
const Product = require('../../models/Product');
const Category = require('../../models/Category');
const Homepage = require('../../models/Homepage');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;


router.all('/*',(req,res,next)=>{
	req.app.locals.layout = 'home';
	next();
});


router.get('/', async (req, res)=>{
    const headerCategories=await Category.aggregate([{$lookup:{from:"subcategories",localField:"_id",foreignField:"category",as:"subcat"}},{$sort:{created_at:-1}}]);
    const dotdProducts=await Product.find({show_in_deals_of_day:true,status:"publish"})
                     .limit(10).sort({created_at:-1})
                     .select({slug:1,name:1,images:1,price:1,discount:1,final_price:1,quantity:1});
    const categories=await Category.find({},{name:1,image:1}).sort({created_at:1}).limit(3);
    let arrayCats=[];
    categories.forEach(cat=>{
        arrayCats.push(cat._id);
    });
    const allCategoriesWithProducts=await Product.aggregate([{$match:{category:{$in:arrayCats},status:"publish"}},
        {$lookup:{from:"categories",localField:"category",foreignField:"_id",as:"cat"}},{$sort:{created_at:-1}}])
        .group({_id:{category_id:'$category'},products:{$push:{name:"$name",_id:"$_id",slug:"$slug",images:"$images",price:"$price",discount:"$discount",final_price:"$final_price"}},category:{$addToSet:"$cat"}})
        .project({products:{$slice:['$products',10]},category:{$arrayElemAt:[{$arrayElemAt:["$category",0]},0]},_id:0});
    
    const topCategories=await Category.find({}).limit(12);
    const newArrivals=await Product.find({status:"publish"}).sort({created_at:-1}).limit(8)
                        .select({slug:1,name:1,images:1,price:1,discount:1,final_price:1});
    const homepage=await Homepage.findOne({type:'homepage'});
    let metaData=[];
    metaData.title="Postidal: Online Shopping for Electronics, Furniture ...";
    metaData.keywords="shopping,ecommerce platform,ecommerce store,ecommerce multi vendor,marketplace multi vendor,seller marketplace";
    metaData.description="Free delivery on millions of items with Gold Membership. Very low prices on top brands, books, furniture, Clothes, electronics, computers, software, apparel ...";
    res.render('home/index',{metaData,dotdProducts,allCategoriesWithProducts,topCategories,newArrivals,homepage,headerCategories});
});
 

router.get('/my-account',(req,res)=>{
    let metaData=[];
    metaData.title="Postidal Sign In";
    metaData.keywords="shopping,ecommerce platform,ecommerce store,ecommerce multi vendor,marketplace multi vendor,seller marketplace";
    metaData.description="Hello Welcome to Your Postidal Log In. Use your email or username, or continue ...";
	res.render('home/my-account',{metaData});
});

router.get('/product/:slug',async (req,res)=>{
    const product=await Product.findOne({slug:req.params.slug}).populate('category').populate('subcategory');
    const relatedProducts=await Product.find({category:product.category}).select({slug:1,name:1,images:1,price:1,final_price:1}).where('_id').ne(product._id).sort({created_at:-1}).limit(10);
    const sameBrandProducts=await Product.find({brand:product.brand}).select({slug:1,name:1,images:1,price:1,final_price:1}).where('_id').ne(product._id).sort({created_at:-1}).limit(2);
    const headerCategories=await Category.aggregate([{$lookup:{from:"subcategories",localField:"_id",foreignField:"category",as:"subcat"}},{$sort:{created_at:-1}}]);
    let metaData=[];
    metaData.title=product.name;
    metaData.keywords="shopping,ecommerce platform,ecommerce store,ecommerce multi vendor,marketplace multi vendor,seller marketplace";
    metaData.description=product.description.replace(/<(.|\n)*?>/g, '');
    metaData.description=metaData.description.replace(/&nbsp;/g,' ');
	res.render('home/product-detail',{metaData,product,relatedProducts,sameBrandProducts,headerCategories});
});

router.get('/cart',(req,res)=>{
    let metaData=[];
    metaData.title="Your Cart";
    metaData.keywords="shopping,ecommerce platform,ecommerce store,ecommerce multi vendor,marketplace multi vendor,seller marketplace";
    metaData.description="Your cart is ready , please click on buy now to book these items";
    res.render('home/cart',{metaData});
});

router.get('/checkout',(req,res)=>{
    let metaData=[];
    metaData.title="Checkout Page";
    metaData.keywords="shopping,ecommerce platform,ecommerce store,ecommerce multi vendor,marketplace multi vendor,seller marketplace";
    metaData.description="Checkout to buy the items you have in your cart";
    res.render('home/checkout',{metaData});
});

router.get('/shop/categories',async (req,res)=>{
    const headerCategories=await Category.aggregate([{$lookup:{from:"subcategories",localField:"_id",foreignField:"category",as:"subcat"}},{$sort:{created_at:-1}}]);
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
    res.render('home/shop-categories',{metaData,headerCategories});
});

router.get('/shop/:first?/:second?/:third?',async (req,res)=>{
    const headerCategories=await Category.aggregate([{$lookup:{from:"subcategories",localField:"_id",foreignField:"category",as:"subcat"}},{$sort:{created_at:-1}}]);
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
    sortConditions[sortKey]=sortValue;
    let conditions={"status":"publish"};
    if(req.query.subcategory){
        conditions['subcategory']=req.query.subcategory;
    }
    if(req.query.category){
        conditions['category']=req.query.category;
    }
    if(req.query.brands){
        conditions['brands']={$in:req.query.brands};
    }
    if(req.query.price){
        conditions['price']={$range:req.query.price}
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
        res.render('home/all-products',{metaData,headerCategories,products,pagination,countProducts,brandsData});
	});
    
});

router.get('/category/:slug',async (req,res)=>{
    const category=await Category.findOne({slug:req.params.slug})
    let metaData=[];
    metaData.title=category.name;
    metaData.keywords="shopping,ecommerce platform,ecommerce store,ecommerce multi vendor,marketplace multi vendor,seller marketplace";
    metaData.description=`Get the best deals on ${category.name} when you shop the largest ...`;
    res.render('home/category-detail',{metaData});
});

router.get('/about-us',(req,res)=>{
    let metaData=[];
    metaData.title="About Us";
    metaData.keywords="shopping,ecommerce platform,ecommerce store,ecommerce multi vendor,marketplace multi vendor,seller marketplace";
    metaData.description="We connect millions of buyers and sellers around the world, empowering people & creating economic opportunity for all.";
    res.render('home/about-us',{metaData});
});

router.get('/contact-us',(req,res)=>{
    let metaData=[];
    metaData.title="Contact Us";
    metaData.keywords="shopping,ecommerce platform,ecommerce store,ecommerce multi vendor,marketplace multi vendor,seller marketplace";
    metaData.description="Contact Us For Any Questions";
    res.render('home/contact-us',{metaData});
});

router.get('/faq',(req,res)=>{
    let metaData=[];
    metaData.title="FAQ";
    metaData.keywords="shopping,ecommerce platform,ecommerce store,ecommerce multi vendor,marketplace multi vendor,seller marketplace";
    metaData.description="Frequently Asked Questions";
    res.render('home/faq',{metaData});
});

// APP LOGIN

passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done)=>{
    User.findOne({email: email}).then(user=>{
        if(!user) return done(null, false, {message: 'No user found'});
        bcrypt.compare(password, user.password, (err, matched)=>{
            if(err) return err;
            if(matched){
                return done(null, user);
            } else {
                return done(null, false, { message: 'Incorrect password' });
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
    passport.authenticate('local', {
        successRedirect: '/admin',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res)=>{
    req.logOut();
    res.redirect('/login');
});


router.post('/register', (req, res)=>{

    let errors = [];

    if(!req.body.firstName) {
        errors.push({message: 'please enter your first name'});
    }
    if(!req.body.lastName) {
        errors.push({message: 'please add a last name'});
    }
    if(!req.body.email) {
        errors.push({message: 'please add an email'});
    }
    if(!req.body.password) {
        errors.push({message: 'please enter a password'});
    }
    if(!req.body.passwordConfirm) {
        errors.push({message: 'This field cannot be blank'});
    }
    if(req.body.password !== req.body.passwordConfirm) {
        errors.push({message: "Password fields don't match"});
    }
    if(errors.length > 0){
        res.render('home/register', {
            errors: errors,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
        })
    } else {
        User.findOne({email: req.body.email}).then(user=>{
            if(!user){
                const newUser = new User({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    password: req.body.password,
                });
                bcrypt.genSalt(10, (err, salt)=>{
                    bcrypt.hash(newUser.password, salt, (err, hash)=>{
                        newUser.password = hash;
                        newUser.save().then(savedUser=>{
                            req.flash('success_message', 'You are now registered, please login')
                            res.redirect('/login');
                        });
                    })
                });
            } else {
                req.flash('error_message', 'That email exist please login');
                res.redirect('/login');
            }
        });
    }
});



router.get('/post/:slug', (req, res)=>{

    Post.findOne({slug: req.params.slug})

        .populate({path: 'comments', match: {approveComment: true}, populate: {path: 'user', model: 'users'}})
        .populate('user')

        .then(post =>{

            Category.find({}).then(categories=>{

                res.render('home/post', {post: post, categories: categories});

            });


        });

});




module.exports = router;