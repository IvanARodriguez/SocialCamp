let Campground = require("../models/campground");
let Comment = require("../models/comment");

//all middleware goes here

let middlewareObj = {};

middlewareObj.checkCampgroundOwnership = (req, res, next)=>{
	//is user logged in
	if(req.isAuthenticated()){
		Campground.findById(req.params.id, (err, foundCampground)=>{
		if(err){
			req.flash("error", "Campground not found");
			res.redirect("back");
		} else if (!foundCampground) {
			req.flash("error", "Item not found!");
			return res.redirect("/campground/");
		} else if(foundCampground.author.id.equals(req.user._id)){
			next();
			} else {
			req.flash("error", "You don't have permission to do that")
			res.redirect("back");
			}
		
	});
	} else {
		req.flash("error", "You need to be logged in to do that!")
		res.redirect("back");
	}
};

middlewareObj.checkCommentOwnership = (req, res, next)=>{
	//is user logged in
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id, (err, foundComment)=>{
		if(err){
			res.redirect("back");
		} else {
			//does the user own the comment?
			if(foundComment.author.id.equals(req.user._id)){
				next();
			} else {
				req.flash("error", "You don't have permision to do that!");
				res.redirect("back");
			}
		}
	}); 	//if not, redirect
	} else {
		req.flash("error", "You need to login to do that!");
		res.redirect("back");
	}
};

middlewareObj.isLoggedIn = (req, res, next)=>{
	if(req.isAuthenticated()){
		return next();
	}
	//if request is coming from AJAX handle the error with a message
	if(req['headers']['content-type'] === 'application/json'){
		return res.send({error: 'Login is required!'});
	}
	req.flash("error", "You need to log in to do that!")
	res.redirect("/login");
};

middlewareObj.isPaid = (req, res, next)=>{
	if(req.user.isPaid) return next()
	   	req.flash("error", "Please pay registration fee before continue!");
		res.redirect("/checkout");
};


module.exports = middlewareObj