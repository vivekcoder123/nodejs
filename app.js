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

 
mongoose.Promise = global.Promise;

app.use(express.static(path.join(__dirname,'public')));

//set view engine

const {select, generateTime} = require('./helpers/handlebars-helpers');

app.engine ('handlebars',exphbs({defaultLayout:'home', helpers: {select: select, generateTime: generateTime}}));
app.set('view engine','handlebars');
 
//upload middleware
app.use(upload());
 
//bodyparser middleware
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
 
mongoose.connect('mongodb://localhost:27017/node_project',{useNewUrlParser:true}).then(db=>{
	console.log('connected to server');
}).catch(error=>{
	console.log('could not connect');
}); 

//methode override middleware
app.use(methodOverride('_method'));

app.use(session({
	secret: 'khalidali8696345',
	resave: true,
	saveUninitialized: true
}));

app.use(flash());

//local variable using middleware
app.use((req,res,next) => {
	res.locals.success_message = req.flash('success_message');
	next();
})

//set routes
const home = require('./routes/home/index');
const admin = require('./routes/admin/index');
const posts = require('./routes/admin/posts');
const categories = require('./routes/admin/categories');

//use routes
app.use('/', home);
app.use('/admin', admin);
app.use('/admin/posts', posts);
app.use('/admin/categories', categories);

const port = process.env.PORT || 3000;

app.listen(port, ()=>{

console.log(`listening on port 3000`);

});