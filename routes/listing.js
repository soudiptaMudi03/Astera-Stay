const express= require("express");
const listingsRoute= express.Router();
const wrapAsync= require("../utils/wrapAsync.js");
//REQUIRING ISLOGGED IN MIDDLEWARE and ISOWNER
const{isLoggedIn,isOwner,validateListing}= require("../middleware.js");
//REQUIRING ALL THE CALLBACK FUNCTIONS FROM CONTROLLER-> listing.js
const listingController=require("../controller/listing.js");
//USING MULTER TO ACCESS THE UPLOADED FILES
const multer= require("multer");
//USING CLOUDINARY STORAGE FOR SAVING FILES
const {storage}=require("../cloudConfig.js");
const upload= multer({storage});

//ROUTES
//index route and create -> add to DB
listingsRoute.route("/")
.get(wrapAsync(listingController.showIndex))
.post(isLoggedIn ,upload.single("listing[image]"), validateListing, wrapAsync(listingController.saveNewListing));

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

//exporting our created listings route so that we can use this route with "/listings" starting path routes
module.exports=listingsRoute;
