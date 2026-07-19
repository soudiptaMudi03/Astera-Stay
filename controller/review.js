const Review = require("../models/review.js");
const Listing = require("../models/listing.js");


module.exports.saveReview= async(req,res)=>{
    //find litsting in which we want to add review
    let listing= await Listing.findById(req.params.id);
    if(!listing){
        req.flash("error","The listing doesn't exist");
        return res.redirect("/listings");
    }
    let newReview= new Review(req.body.review);// creattw new review from form data

    listing.reviews.push(newReview);//adding review to listing

    //saving review and updating the existing listing after adding new review
    await newReview.save();
    await listing.save();
    req.flash("success","New Review Added");  
    res.redirect(`/listings/${listing._id}`);
};

module.exports.deleteReview= async(req,res)=>{
    let {id,reviewId}=req.params;
    await Review.findByIdAndDelete(reviewId);//deleting reviews from reviews collection

    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});//deleting review IDs saved in a particular listing.reviews array

    req.flash("success","Review Deleted");  
    res.redirect(`/listings/${id}`);
};