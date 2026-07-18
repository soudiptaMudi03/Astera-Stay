const Listing= require("./models/listing.js");
const ExpressError=require("./utils/ExpressError.js");
const {validSchema,validReview}=require("./utils/schema.js");



module.exports.isLoggedIn= (req,res,next)=>{
    // console.log(req.user);
    if(!req.isAuthenticated()){
        req.flash("error","You have to log in to use this functionality" );
        req.session.redirectUrl=req.originalUrl;//saving this for re-redirect to current page after successful login if not loggid in and try to update
        return res.redirect("/login");//as this is a middleware fn
    }
    next();
}
// module.exports={isLoggedIn};

//for sequrity, so that the saved url is not used after the current route redirection -> as local is avalible for 1 redirection only otherwise we ahve to delete our saved redirect url for session as session is avalible for whoole the session.
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {//if login for updation
        res.locals.redirectUrl = req.session.redirectUrl;
        next();  
    } 
    else{
        res.locals.redirectUrl="/listings";//if direct login
        next();
    }
};
// For example, when a user tries to access a protected route but is redirected to a login page, the original URL they were trying to access is often saved so that, after successful authentication, they can be redirected back to that original URL.

module.exports.isOwner= async(req,res,next)=>{
    let {id}=req.params;
    // console.log("ID ",id);
    let listing= await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","You are not the owner of this");
        return res.redirect(`/listings/${id}`);
    }
    next();
}


module.exports.validateListing= (req,res,next)=>{ //can be used in middleware chaining to check schem validations
    let {error}= validSchema.validate(req.body);
    //exteacting other error datas
    if(error){
        const errMsg= error.details.map((el)=>el.message).join(",");
        console.log(errMsg);
        console.log(error.details);
        throw new ExpressError(400,error);
    }
    else{
        next();
    }
}


module.exports.validateReview= (req,res,next)=>{ //can be used in middleware chaining to check schem validations
    let {error}= validReview.validate(req.body);
    //exteacting other error datas
    if(error){
        const errMsg= error.details.map((el)=>el.message).join(",");
        console.log(errMsg);
        console.log(error.details);
        throw new ExpressError(400,error);
    }
    else{
        next();
    }
}