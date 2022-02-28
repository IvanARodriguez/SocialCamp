let express = require("express");
let router 	= express.Router({mergeParams: true});
let Campground = require("../models/campground");
let Comment = require("../models/comment");
let {checkCommentOwnership, isLoggedIn, isPaid} = require("../middleware");
router.use(isLoggedIn, isPaid);

//=======================
// COMMENT ROUTE ========
//=======================

//Comments new_______________________________
router.get("/new", (req, res)=>{
	//find campground by id
	Campground.findById(req.params.id, (err, campground)=>{
		if(err){
			console.log(err);
		} else {
			res.render("comments/new", {campground: campground});
		}
	})
});
//Coments create_____________________________
router.post("/",(req, res)=>{
	//lookup campground using findById
	Campground.findById(req.params.id, (err, campground)=>{
		if(err){
			req.flash("error", "Something went wrong");
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			// create a new comments
			Comment.create(req.body.comment, (err, comment)=>{
				if(err){
					req.flash("error", "Something went wrong");
					console.log(err);
				} else {
					//add username and id to comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					//save comment
					comment.save();
					// connect new comment to campground
					campground.comments.push(comment);
					campground.save();;
					req.flash("success", "Successfully added comment");
					//redirect campground show page
					res.redirect('/campgrounds/' + campground._id);
				}
			});
		}
	})
});
//ROUTE TO EDIT COMMENT
router.get("/:comment_id/edit", checkCommentOwnership,(req, res)=>{
	Comment.findById(req.params.comment_id, (err, foundComment)=>{
		if(err || !foundComment){
			res.flash("error", "Unable to edit, Try again!");
			res.redirect("back");
		} else {
			res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
		}
	});
});
// COMMENT UPDATE
router.put("/:comment_id", checkCommentOwnership,(req, res)=>{
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComments)=>{
		if(err || !updatedComments){
			res.flash("error", "Unable to update, Try again!");
			res.redirect("back");
		} else {
			req.flash("success", "Comment updated!")
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

//COMMENT DESTROY ROUTE
router.delete("/:comment_id", checkCommentOwnership,(req, res)=>{
	Comment.findByIdAndRemove(req.params.comment_id, (err)=>{
		if(err){
			res.redirect("back");
		} else {
			res.flash("success", "Comment deleted!")
			res.redirect("/campgrounds/" + req.params.id);
		}
	})
});

module.exports = router;