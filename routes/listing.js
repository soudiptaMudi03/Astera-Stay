const express= require("express");
const listingsRoute= express.Router();
const Listing=require("../models/listing.js");
const wrapAsync= require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const {validSchema}=require("../utils/schema.js");
//REQUIRING ISLOGGED IN MIDDLEWARE and ISOWNER
const{isLoggedIn,isOwner,validateListing}= require("../middleware.js");
// console.log(isLoggedIn);
//REQUIRING ALL THE CALLABCK FUNCTION FORM CONTROLLER-> listing.js
const listingController=require("../controller/listing.js");
//USING MULETER TO ACCESS THE UPLOADED FILES
const multer= require("multer");
// const upload= multer({dest:"uploads/"});//initilize the local save folder for the uploaded files
//USING CLODINARY STORAGE FOR SAVING FILES
const {storage}=require("../cloudConfig.js");
const upload= multer({storage});//initilize the local save folder for the uploaded files




//MIDDLEWARE FN FOR CHECKING SCHEMA VALIDATION DIRECTLY
// let validateListing= (req,res,next)=>{ //can be used in middleware chaining to check schem validations
//     let {error}= validSchema.validate(req.body);
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


//ROUTES
//index route and create -> add to DB
listingsRoute.route("/")
.get(wrapAsync(listingController.showIndex))
.post(isLoggedIn ,upload.single("listing[image]"), validateListing, wrapAsync(listingController.saveNewListing)); //we have to update the valid listing also
// .post(upload.single("listing[image]"),(req,res)=>{
//     res.send(req.file);
// });


//create route
//new 
listingsRoute.get("/new",isLoggedIn,listingController.serveNewForm);


//show route, update route and delete route
listingsRoute.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn,isOwner, upload.single("listing[image]"),validateListing, wrapAsync(listingController.saveEditListing))
.delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));

//edit route
listingsRoute.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.serveEditForm));





// //ROUTES
// //index route
// listingsRoute.get("/",wrapAsync(listingController.showIndex));

// //create route
// //new 
// listingsRoute.get("/new",isLoggedIn,listingController.serveNewForm);
// //add to DB
// listingsRoute.post("/",isLoggedIn ,validateListing, wrapAsync(listingController.saveNewListing));

// //show route
// listingsRoute.get("/:id",wrapAsync(listingController.showListing));

// //edit route
// listingsRoute.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.serveEditForm));
// //update
// listingsRoute.put("/:id",isLoggedIn,isOwner,validateListing, wrapAsync(listingController.saveEditListing));

// //delete route
// listingsRoute.delete("/:id",isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));



//exporting our created listings route so taht we can use this route with "/listings" starting path routes
module.exports=listingsRoute;







//routes
//index route
// listingsRoute.get("/",wrapAsync(async(req,res)=>{
//     const listings=  await Listing.find();
//     // console.log(listings);
//     res.render("Listings/index.ejs",{listings});
// }));



// //create route
// //new 
// listingsRoute.get("/new",isLoggedIn,(req,res)=>{ //before rendering the new form we have to check or user is logged in or authenticated for current session or not using req.user maintained by passport
//     res.render("listings/new.ejs");
// });
// //add to DB
// listingsRoute.post("/",isLoggedIn ,validateListing, wrapAsync(async(req,res,next)=>{ //using wrap async for handling our errors AND if validateListing is passed then only out next middle ware fn is executed or err will be thrown to the next error handling middlewares
//     if(!req.body.listing){ //to handle if any listing is not coming with req.body -> post req by hoppscotch with no body sent
//         next(new ExpressError(400,"Please send a valid listing"));
//     }

//     //USING SCHEMA VALIDATORS OF JOI MANUALLY
//     // const result= validSchema.validate(req.body);
//     // console.log(result);
//     // if(result.error){
//     //     throw (new ExpressError(400,result.error));
//     // }

//     // try{
//     //     const newListing= new Listing({...req.body.listing});
//     // await newListing.save() //isme error aane pe catch block me direct catch hoga
//     // // .then((res)=>{
//     // //     console.log("data added");
//     // // })
//     // // .catch((err)=>{
//     // //     console.log("error aya ",err);
//     // // })
//     // res.redirect("/listings");
//     // }
//     // catch(err){
//     //     next(err); //calling next error handler
//     // }
//     //OR
//     // const newListing= new Listing({...req.body.listing});
//     const newListing= new Listing(req.body.listing);

//     //BULKEY WAY FOR CHECKING SCHEMA VALIDATION -> server validations  
//     // if(!newListing.desc)
//     //     next(new ExpressError(400,"Please send a valid desc"));
//     // if(!newListing.price)
//     //     next(new ExpressError(400,"Please send a valid price"));
//     // if(!newListing.location)
//     //     next(new ExpressError(400,"Please send a valid location"));

//     //save owner of the created listing
//     newListing.owner=req.user._id; //uses passport

//     await newListing.save() //isme error aane pe catch block me direct catch hoga
//     // .then((res)=>{
//     //     console.log("data added");
//     // })
//     // .catch((err)=>{
//     //     console.log("error aya ",err);
//     // })

//     //create a flash message
//     req.flash("success","New Listing Created");  
    
//     res.redirect("/listings");
// }));



// //show route
// listingsRoute.get("/:id",wrapAsync(async(req,res)=>{
//     let {id}= req.params;
//     const listing= await Listing.findById(id).populate("reviews").populate("owner");//we use populate so that we got all the reviews of the listing with details
//     //if the requested listing is not present then an error flash is created
//     if(!listing){
//         req.flash("error","The listing doesn't exist");
//         res.redirect("/listings"); //and we are redirected to our index route directly on wrong route request
//     }
//     console.log(listing);
//     res.render("Listings/show.ejs",{listing});
// }));


// //REVIEW ROUTE
// //save review route
// listingsRoute.post("/:id/review",validateReview, wrapAsync(
//     async(req,res)=>{
//         //find litsting in which we want to add review
//         let listing= await Listing.findById(req.params.id);
//         let newReview= new Review(req.body.review);// creattw new review from form data
    
//         listing.reviews.push(newReview);//adding review to listing
    
//         //saving review and updating the existing listing after adding new review
//         await newReview.save();
//         await listing.save();
//         console.log("review added");
//         res.redirect(`/listings/${listing._id}`);
//     }
// ));

// //delete review route
// listingsRoute.delete("/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
//     let {id,reviewId}=req.params;
//     await Review.findByIdAndDelete(reviewId);//deleting reviews from reviews collection

//     await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});//deleting review IDs saved in a particular listing.reviews array

//     res.redirect(`/listings/${id}`);
// }));


// //edit route
// listingsRoute.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(async(req,res)=>{
//     let {id}= req.params;
//     const listing= await Listing.findById(id);
//     if(!listing){
//         req.flash("error","The listing doesn't exist");
//         res.redirect("/listings");
//     }
//     res.render("Listings/edit.ejs",{listing});
// }));
// //update
// listingsRoute.put("/:id",isLoggedIn,isOwner,validateListing, wrapAsync(async(req,res)=>{
//     if(!req.body.listing){
//         next(new ExpressError(400,"Please send a valid listing"));
//     }
//     const{id}=req.params;
//     //getting data obj of form from req body
//     const listing=req.body.listing;
//     console.log(listing);
//     await Listing.findByIdAndUpdate(id,{...listing});
//     req.flash("success","Listing Updated");  
//     res.redirect(`/listings/${id}`);
// }));



// //delete route
// listingsRoute.delete("/:id",isLoggedIn,isOwner,wrapAsync(async(req,res)=>{
//     const {id}=req.params;
//     let deletedListing= await Listing.findByIdAndDelete(id);
//     console.log(deletedListing);
//     req.flash("success","Listing Deleted");  
//     res.redirect("/listings");
// }));


// //exporting our created listings route so taht we can use this route with "/listings" starting path routes
// module.exports=listingsRoute;