const express=require("express");
const userRoute=express.Router();
const User= require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
//USING PASSPORT FOR AUTHINTICATION
const passport= require("passport");
const {saveRedirectUrl}=require("../middleware.js");
//REQUIRING USER CONTROLLER FUNCTIONS
const userController= require("../controller/user.js");




//EXTRA HERE -> homepage should have its own rouye and file but for temporary reason swe set homepage to this user page
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




//EXTRA-root route control
userRoute.route("/")
    .get(userController.homeView)




// //SIGN UP ROUTES
// userRoute.get("/signup",userController.signupForm);

// userRoute.post("/signup",wrapAsync(userController.saveSignupDetails));

// //LOGIN ROUTES
// userRoute.get("/login",userController.serveLoginForm);

// userRoute.post("/login",saveRedirectUrl,passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}),userController.checkLogin);

// //LOGOUT ROUTE
// userRoute.get("/logout",userController.logout);



module.exports=userRoute;








//SIGN UP ROUTES
// userRoute.get("/signup",(req,res)=>{
//     res.render("users/signup.ejs");
// });

// userRoute.post("/signup",wrapAsync(async(req,res)=>{
//     try{
//         let{username,email,password}=req.body;
//         const newUser=new User({username,email});
//         let registeredUser=await User.register(newUser,password);
//         console.log(registeredUser);
//         //auto login after signup
//         req.login(registeredUser,((err)=>{
//             if(err){
//                 next(err);
//             }
//             req.flash("success","Welcome to WanderLust");
//             res.redirect("/listings");
//         }));
//     }
//     catch(err){
//         req.flash("error","Username already taken");
//         res.redirect("/signup");
//     }
// }));


// //LOGIN ROUTES
// userRoute.get("/login",(req,res)=>{
//     res.render("users/login.ejs");
// });

//post req anne pe req body ka data passport authinticate krega, using the strategy obj defined in index.js as a middleware with some options also
// userRoute.post("/login",saveRedirectUrl,passport.authenticate("local",{failureRedirect:"/login",         failureFlash:true}),async(req,res)=>{
//     req.flash("success","Welcome Back");
//     // res.redirect("/listings");
//     let redirectUrl=res.locals.redirectUrl;
//     res.redirect(redirectUrl);
// });

// //LOGOUT ROUTE
// userRoute.get("/logout",(req,res,next)=>{
//     req.logout((err)=>{ //this logout is inbuit fn of pasport to clear session user data
//         if(err){
//             return next(err);
//         }
//         req.flash("success","you are logged out now");
//         res.redirect("/listings");
//     });
// });


// module.exports=userRoute;