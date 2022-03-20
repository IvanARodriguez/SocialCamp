var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground").default;
var { checkCampgroundOwnership, isLoggedIn, isPaid} = require("../middleware");

var NodeGeocoder = require('node-geocoder');
var options = {
	provider: 'google',
	httpAdapter: 'https',
	apiKey: process.env.GEOCODER_API_KEY,
	formatter: null
};
var geocoder = NodeGeocoder(options);

router.use(isLoggedIn, isPaid);

//INDEX: Shows all the campgrounds!========================================
router.get("/", (req, res)=>{
	if(req.query.paid) res.locals.success = 'Payment succeded, welcome to YelpCamp!';
	//GET ALL CAMPRGROUND FROM DB
	Campground.find({}, (err, allCampgrounds)=>{
		if (err){
			console.log("There has been an error!")
		} else {
			res.render("campgrounds/index", {campgrounds: allCampgrounds});
		}
	});
});

//CREATE: Add a new campground to the database!===========================
router.post("/", isLoggedIn, (req, res) => {
	//get data from form and add to campground array
	var name = req.body.name;
	var price = req.body.price;
	var image = req.body.image;
	var desc = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	}
	geocoder.geocode(req.body.location, (err, data)=>{
		if (err || !data.length) {
			req.flash('error', 'Invalid address');
			return res.redirect('back');
		}
		var lat = data[0].latitude;
		var lng = data[0].longitude;
		var location = data[0].formattedAddress;
		var newCampground = {name: name, price: price, image: image, description: desc, author: author, location: location, lat: lat, lng: lng};	
		// create a new campground and save to the database...
		Campground.create(newCampground, (err, newlyCreated)=>{
			if(err){
				console.log(err);
			} else {
				//redirect back to campgrounds page
				res.redirect("/campgrounds");
			}
		});
	});
});

//NEW: shows the form to create new campgrounds ========================
router.get("/new", isLoggedIn, (req, res)=>{
	res.render("campgrounds/new");
});

//SHOW extra info about one campgrounds ==================================
router.get("/:id", (req, res)=>{
	//find the campground provided
	Campground.findById(req.params.id).populate("comments").exec((err, foundCampground)=>{
		if(err || !foundCampground){
			req.flash("error", "campground does not exist!");
			return res.redirect("/campgrounds");
			console.log(err);
		} else {
			// RENDER SHOW TEMPLATE WITH THAT ID
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
});

 //EDIT CAMPGROUND ROUTE
router.get("/:id/edit", checkCampgroundOwnership, (req, res)=>{
	Campground.findById(req.params.id, (err, foundCamground)=>{
		if(err){
			req.flash("error", "Campground not found");
			res.redirect("back");
		} else {
			res.render("campgrounds/edit", {campground: foundCamground});
		}
	});
});

//UPDATE CAMPGROUND ROUTE
router.put("/:id", checkCampgroundOwnership, (req, res)=>{
	geocoder.geocode(req.body.location, (err, data)=>{
		if (err || !data.length) {
			req.flash('error', 'Invalid address');
			return res.redirect('back');
		}
		var lat = data[0].latitude;
		var lng = data[0].longitude;
		var location = data[0].formattedAddress;
		var newData = {name: req.body.name, image: req.body.image, description: req.body.description, location: location, lat: lat, lng: lng};
	//find and update the correct campground
		Campground.findByIdAndUpdate(req.params.id, newData, (err, campground)=>{
			if(err){
				req.flash("error", "err.message!");
				res.redirect("back");
			} else {
				req.flash("success", "Campground updated!")
				res.redirect("/campgrounds/" + campground._id);
			}
		});
	});
});

//DESTROY CAMPGROUND ROUTE
router.delete("/:id", checkCampgroundOwnership, (req, res)=>{
	Campground.findByIdAndRemove(req.params.id, (err, deleteCampground)=>{
		if(err){
			console.log(err)
		} else {
			res.redirect("/campgrounds")
		}
	})
});

module.exports = router;