require('dotenv').config();

let express 			= require("express"),
	app 				= express(),
	bodyParser 			= require("body-parser"),
 	mongoose 			= require("mongoose"),
	flash				= require('connect-flash'),
	passport			= require("passport"),
	LocalStrategy		= require("passport-local"),
	methodOverride		= require("method-override"),
	Campground			= require("./models/campground"),
	Comment				= require("./models/comment"),
	User				= require("./models/user"),
	seedDB				= require("./seeds")

let commentRoutes 		= require("./routes/comments"),
	campgroundRoutes 	= require("./routes/campgrounds"),
	indexRoutes 		= require("./routes/index");

mongoose.connect("mongodb://localhost/27017",{
					useUnifiedTopology: true,
					useNewUrlParser: true,
					useFindAndModify: false,
					useCreateIndex: true})
				.then(() => console.log('DB connected!'));

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
// seedDB(); // seed the database

//PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "Buy a dog when you have a baby!",
	resave: false,
	saveUninitialized: false
}));

app.locals.moment = require('moment');

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(flash());
app.use((req, res, next)=>{
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

//requiring Routes
app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

//Start the server=====================================

app.listen(3000, ()=>{
	console.log("server has started!")
});