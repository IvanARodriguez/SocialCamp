let express 	= require("express");
let router 		= express.Router();
let passport 	= require("passport");
let User		= require("../models/user");
const {isLoggedIn} = require('../middleware');
// Set your secret key. Remember to switch to your live secret key in production!
// See your keys here: https://dashboard.stripe.com/account/apikeys
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// ===========================
// AUTH AND INDEX ROUTES =====
// ===========================

//Root routes
router.get("/", (req, res)=>{
	res.render("landing");
});
//Register form Route
router.get("/register", (req, res)=>{
	res.render("register");
});
//handle sign up logic
router.post("/register",(req, res)=>{
	let newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, (err, user)=>{
		if(err){
			console.log(err);
			req.flash("error", err.message);
			return res.redirect("register");
		}
		passport.authenticate("local")(req, res, ()=>{
			req.flash("success", "Welcome to YelpCamp " + user.username);
			res.redirect("/checkout");
		});
	});
});
// show login form==========================================
router.get("/login", (req, res)=>{
	res.render("login");
});
//handle login logics======================================
router.post("/login", passport.authenticate("local", {
		successRedirect: "/campgrounds",
		failureRedirect:"/login"
		}), (req, res)=>{
});
//logout route
router.get("/logout", (req, res)=>{
	req.logout();
	req.flash("error", "Succesfully logged out!");
	res.redirect("/campgrounds");
});

//GET checkout Route ======================================
router.get('/checkout', isLoggedIn,(req, res) => {
	if (req.user.isPaid) {
		req.flash('success', 'Your Account is already paid');
		return res.redirect('/campgrounds');
	}
	res.render('checkout', {amount: 20});
});

//POST pay route============================================
router.post("/pay", isLoggedIn, async (req, res) => {
  const { paymentMethodId, items, currency } = req.body;

  const amount = 2000;

  try {
    // Create new PaymentIntent with a PaymentMethod ID from the client.
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: currency,
      payment_method: paymentMethodId,
      error_on_requires_action: true,
      confirm: true
    });

    console.log("💰 Payment received!");
	  
	req.user.isPaid = true;
	await req.user.save();
    // The payment is complete and the money has been moved
    // You can add any post-payment code here (e.g. shipping, fulfillment, etc)

    // Send the client secret to the client to use in the demo
    res.send({ clientSecret: intent.client_secret });
  } catch (e) {
    // Handle "hard declines" e.g. insufficient funds, expired card, card authentication etc
    // See https://stripe.com/docs/declines/codes for more
    if (e.code === "authentication_required") {
      res.send({
        error:
          "This card requires authentication in order to proceeded. Please use a different card."
      });
    } else {
      res.send({ error: e.message });
    }
  }
});

module.exports = router;