const express = require('express');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const upload = require('express-fileupload');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const config=require('./env.json');
const Cartconfig = require('./config/config.js');
const compression = require('compression');
const redis=require("redis");
let headerCategories=[];
let menuCategories=[];

mongoose.Promise = global.Promise;
app.use(compression());
app.use(express.static(path.join(__dirname,'public')));

//set view engine

const {select, generateTime, paginate, gt, ne, multiply, add, subtract, divide, eq, contains, or, and} = require('./helpers/handlebars-helpers');

app.engine ('handlebars',exphbs({defaultLayout:'home', helpers: {select,generateTime,paginate,gt,ne,multiply,add,subtract,divide,eq,contains,or,and}}));
app.set('view engine','handlebars');

//upload middleware
app.use(upload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));
//bodyparser middleware
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
 
mongoose.connect('mongodb://localhost:27017/postidal',{useNewUrlParser:true,useCreateIndex:true}).then(async (db)=>{
	console.log('connected to server');
}).catch(error=>{
	console.log('could not connect');
});

//methode override middleware
app.use(methodOverride('_method'));

app.use(session({
	secret: 'vivek12345',
	resave: true,
	saveUninitialized: true
}));

app.use(flash());

//passport
app.use(passport.initialize())
app.use(passport.session());

//local variable using middleware
app.use((req,res,next) => {
	res.locals.user = req.user || null;
	res.locals.success_message = req.flash('success_message');
	res.locals.error_message = req.flash('error_message');
	res.locals.error = req.flash('error');
	res.locals.config=config;
	res.locals.headerCategories=headerCategories;
	res.locals.menuCategories=menuCategories;
	res.locals.paypal = Cartconfig.paypal;
	res.locals.locale = Cartconfig.locale;
	res.locals.session=req.session;
	if(!req.session.cart) {
		req.session.cart = {
			items: [],
			totals: 0.00,
			withoutShippingTotals: 0.00,
			formattedTotals: ''
		};
	}
	next();
})

//set routes
const home = require('./routes/home/index');
const admin = require('./routes/admin/index');
const products = require('./routes/admin/products');
const categories = require('./routes/admin/categories');
const subcategories = require('./routes/admin/subcategories');
const rooms = require('./routes/admin/rooms');
const orders = require('./routes/admin/orders');
const comments = require('./routes/admin/comments');

//use routes
app.use('/', home);
app.use('/admin', admin);
app.use('/admin/products', products);
app.use('/admin/categories', categories);
app.use('/admin/subcategories', subcategories);
app.use('/admin/comments', comments);
app.use('/admin/rooms', rooms);
app.use('/admin/orders', orders);
app.use((req, res) => {
	res.render("errors/404",{error_page:Math.ceil(Math.random()*2)})
});

// const port_redis=process.env.REDIST_PORT || 6379;
const port = process.env.PORT || 8080;

// const redis_client=redis.createClient(port_redis);

app.listen(port, ()=>{
	console.log(`listening on port 8080`);
});
