const express=require("express");
const userRoute=express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
//USING PASSPORT FOR AUTHENTICATION
const passport= require("passport");
const {saveRedirectUrl}=require("../middleware.js");
//REQUIRING USER CONTROLLER FUNCTIONS
const userController= require("../controller/user.js");

//EXTRA HERE -> homepage should have its own route and file but for now homepage points here
userRoute.route("/home")
    .get(userController.homeView)

userRoute.route("/book")
    .get(userController.bookView)

//SIGN UP ROUTES
userRoute.route("/signup")
.get(userController.signupForm)
.post(wrapAsync(userController.saveSignupDetails));

//LOGIN ROUTES
userRoute.route("/login")
.get(userController.serveLoginForm)
.post(saveRedirectUrl,passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}),userController.checkLogin);

//LOGOUT ROUTE
userRoute.get("/logout",userController.logout);

//root route control
userRoute.route("/")
    .get(userController.homeView)

module.exports=userRoute;
