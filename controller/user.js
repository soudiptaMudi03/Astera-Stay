const User= require("../models/user.js");

module.exports.homeView = (req, res) => {
    res.render("users/home.ejs");
};

module.exports.bookView = (req, res) => {
    res.render("users/book.ejs");
};

module.exports.signupForm= (req,res)=>{
    res.render("users/signup.ejs");
};

module.exports.saveSignupDetails = async(req,res)=>{
    try{
        let{username,email,password}=req.body;
        const newUser=new User({username,email});
        let registeredUser=await User.register(newUser,password);
        console.log(registeredUser);
        //auto login after signup
        req.login(registeredUser,((err)=>{
            if(err){
                next(err);
            }
            req.flash("success","Welcome to WanderLust");
            res.redirect("/listings");
        }));
    }
    catch(err){
        req.flash("error","Username already taken");
        res.redirect("/signup");
    }
};

module.exports.serveLoginForm= (req,res)=>{
    res.render("users/login.ejs");
};

module.exports.checkLogin= async(req,res)=>{
    req.flash("success","Welcome Back");
    // res.redirect("/listings");
    let redirectUrl=res.locals.redirectUrl;
    res.redirect(redirectUrl);
};

module.exports.logout= (req,res,next)=>{
    req.logout((err)=>{ //this logout is inbuit fn of pasport to clear session user data
        if(err){
            return next(err);
        }
        req.flash("success","you are logged out now");
        res.redirect("/listings");
    });
};

