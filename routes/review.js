const express=require("express");
const reviewRoute=express.Router({mergeParams:true});//mergeparams for getting parent routes parameters
const Listing=require("../models/listing.js");
const wrapAsync= require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const {validReview}=require("../utils/schema.js");
const Review = require("../models/review.js");
const{validateReview,isLoggedIn,isOwner}= require("../middleware.js");
//REQUIRING REVIEW CONTROLLER
const reviewController= require("../controller/review.js");

 
//REVIEW VALIDTIONS //shifted to middleware.js
// let validateReview= (req,res,next)=>{ //can be used in middleware chaining to check schem validations
//     let {error}= validReview.validate(req.body);
//     //exteacting other error datas
//     if(error){
//         const errMsg= error.details.map((el)=>el.message).join(",");
//         console.log(errMsg);
//         console.log(error.details);
//         throw new ExpressError(400,error);
//     }
//     else{
//         next();
//     }
// }



//REVIEW ROUTE
//save review route -> we have to implement the security for the review route also
reviewRoute.post("/",validateReview, wrapAsync(reviewController.saveReview));

//delete review route
reviewRoute.delete("/:reviewId",wrapAsync(reviewController.deleteReview));


module.exports=reviewRoute;






//REVIEW ROUTE
//save review route
// reviewRoute.post("/",validateReview, wrapAsync(
//     async(req,res)=>{
//         //find litsting in which we want to add review
//         let listing= await Listing.findById(req.params.id);
//         let newReview= new Review(req.body.review);// creattw new review from form data
    
//         listing.reviews.push(newReview);//adding review to listing
    
//         //saving review and updating the existing listing after adding new review
//         await newReview.save();
//         await listing.save();
//         console.log("review added");
//         req.flash("success","New Review Added");  
//         res.redirect(`/listings/${listing._id}`);
//     }
// ));

// //delete review route
// reviewRoute.delete("/:reviewId",isOwner,wrapAsync(async(req,res)=>{
//     let {id,reviewId}=req.params;
//     await Review.findByIdAndDelete(reviewId);//deleting reviews from reviews collection

//     await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});//deleting review IDs saved in a particular listing.reviews array

//     req.flash("success","Review Deleted");  
//     res.redirect(`/listings/${id}`);
// }));

// module.exports=reviewRoute;