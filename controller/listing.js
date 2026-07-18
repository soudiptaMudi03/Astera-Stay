const Listing=require("../models/listing.js");
//using map while listing addition
// import * as maptilersdk from '@maptiler/sdk';
// const maptilersdk = require('@maptiler/sdk').catch((e)=>{
//     console.log(e);
// });
// const maptilersdk = require('@maptiler/sdk/dist/index.js'); 
const axios = require('axios');
let mapToken= process.env.MAP_TOKEN;
// maptilersdk.config.apiKey = mapToken;

module.exports.showIndex= async(req,res)=>{
    const listings=  await Listing.find();
    // console.log(listings);
    res.render("Listings/index.ejs",{listings});
};


module.exports.serveNewForm= (req,res)=>{ //before rendering the new form we have to check or user is logged in or authenticated for current session or not using req.user maintained by passport
    res.render("Listings/new.ejs");
};


module.exports.saveNewListing= async(req,res,next)=>{ //using wrap async for handling our errors AND if validateListing is passed then only out next middle ware fn is executed or err will be thrown to the next error handling middlewares

    //using maptiler api for converting place to cordinates
    let placeName=req.body.listing.location+", "+req.body.listing.country;
    console.log(placeName);
    const mapUrl = `https://api.maptiler.com/geocoding/${placeName}.json?key=r1NiBUKVV6TlRkAdmDM7`;
    const response = await axios.get(mapUrl);
    // console.log(response.data.features[0].geometry);

    if(!req.body.listing){ //to handle if any listing is not coming with req.body -> post req by hoppscotch with no body sent
        next(new ExpressError(400,"Please send a valid listing"));
    }

    //USING SCHEMA VALIDATORS OF JOI MANUALLY
    // const result= validSchema.validate(req.body);
    // console.log(result);
    // if(result.error){
    //     throw (new ExpressError(400,result.error));
    // }

    // try{
    //     const newListing= new Listing({...req.body.listing});
    // await newListing.save() //isme error aane pe catch block me direct catch hoga
    // // .then((res)=>{
    // //     console.log("data added");
    // // })
    // // .catch((err)=>{
    // //     console.log("error aya ",err);
    // // })
    // res.redirect("/listings");
    // }
    // catch(err){
    //     next(err); //calling next error handler
    // }
    //OR
    // const newListing= new Listing({...req.body.listing});
    const newListing= new Listing(req.body.listing);

    //BULKEY WAY FOR CHECKING SCHEMA VALIDATION -> server validations  
    // if(!newListing.desc)
    //     next(new ExpressError(400,"Please send a valid desc"));
    // if(!newListing.price)
    //     next(new ExpressError(400,"Please send a valid price"));
    // if(!newListing.location)
    //     next(new ExpressError(400,"Please send a valid location"));

    //save owner of the created listing
    newListing.owner=req.user._id; //uses passport

    //NEW IMAGE LINK SAVE IN MONGO
    let url=req.file.path; //req.file se image ka detaile nikalo
    let filename=req.file.filename;
    newListing.image={url,filename}; //save se phle inage field me woh fill krdo
    newListing.geometry=response.data.features[0].geometry;
    let savedListing=await newListing.save() //isme error aane pe catch block me direct catch hoga
    // console.log(savedListing);
    // .then((res)=>{
    //     console.log("data added");
    // })
    // .catch((err)=>{
    //     console.log("error aya ",err);
    // })

    //create a flash message
    req.flash("success","New Listing Created");  
    
    res.redirect("/listings");
}


module.exports.showListing= async(req,res)=>{
    let {id}= req.params;
    const listing= await Listing.findById(id).populate("reviews").populate("owner");//we use populate so that we got all the reviews of the listing with details
    //if the requested listing is not present then an error flash is created
    if(!listing){
        req.flash("error","The listing doesn't exist");
        res.redirect("/listings"); //and we are redirected to our index route directly on wrong route request
    }
    console.log(listing);
    res.render("Listings/show.ejs",{listing});
};


module.exports.serveEditForm= async(req,res)=>{
    let {id}= req.params;
    const listing= await Listing.findById(id);
    if(!listing){
        req.flash("error","The listing doesn't exist");
        res.redirect("/listings");
    }

    //COMPRESSING THE IMAGE FOR PREVIEWING USING CLOUDINARY API
    let originalImageUrl= listing.image.url;
    let compressedImageUrl= originalImageUrl.replace("/upload","/upload/w_300")
    // console.log(compressedImageUrl);
    res.render("Listings/edit.ejs",{listing,compressedImageUrl});
};


module.exports.saveEditListing= async(req,res)=>{
    if(!req.body.listing){
        next(new ExpressError(400,"Please send a valid listing"));
    }
    const{id}=req.params;
    //getting data obj of form from req body
    const listing=req.body.listing;
    console.log(listing);
    const updatedListing=await Listing.findByIdAndUpdate(id,{...listing});
    //setting image url on updation if new file is uploaded
    if(req.file){
        let url= req.file.path;
        let filename= req.file.filename;
        updatedListing.image={url,filename};
        updatedListing.save();
    }

    req.flash("success","Listing Updated");  
    res.redirect(`/listings/${id}`);
};


module.exports.destroyListing= async(req,res)=>{
    const {id}=req.params;
    let deletedListing= await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted");  
    res.redirect("/listings");
};