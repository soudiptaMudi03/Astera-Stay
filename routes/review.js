const express=require("express");
const reviewRoute=express.Router({mergeParams:true});//mergeparams for getting parent routes parameters
const wrapAsync= require("../utils/wrapAsync.js");
const{validateReview,isLoggedIn}= require("../middleware.js");
//REQUIRING REVIEW CONTROLLER
const reviewController= require("../controller/review.js");

//REVIEW ROUTE
//save review route
reviewRoute.post("/",isLoggedIn,validateReview, wrapAsync(reviewController.saveReview));

//delete review route
//NOTE: previously had no auth middleware at all - any visitor, logged in or not, could delete
//any review by guessing/finding its id. isLoggedIn is now required; add an isReviewAuthor check
//(comparing review.author to the current user) if you want to restrict deletion to the review's
//own author specifically.
reviewRoute.delete("/:reviewId",isLoggedIn,wrapAsync(reviewController.deleteReview));

module.exports=reviewRoute;
