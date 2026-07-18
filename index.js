//USING DOTENV FOR ACCESSING OUR CLOUD CREDENTIALS
if(process.env.NODE_ENV!="production"){
    require("dotenv").config();
    // console.log(process.env.CLOUD_NAME);
}

//requiring all the meeded modules
const express=require("express");
const app= express();
const axios = require('axios');
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path= require("path");
const methodOverride=require("method-override");
//EJS MATE -> to apply boiler plate styling across diff ejs files
const ejsMate= require("ejs-mate");
//ERROR HANDLER REQUIRED
const wrapAsync= require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const {validSchema,validReview}=require("./utils/schema.js");
const Review = require("./models/review.js");
//ROUTES
const listingRoute=require("./routes/listing.js");
const reviewRoute=require("./routes/review.js");
//USING EXPRESS SESSION
const session=require("express-session");

// for online deplyment
//USING MONGO SESSION STORE
const MongoStore=require("connect-mongo");

//USING FLASH 
const flash=require("connect-flash");
//USING PASSPORT
const passport=require("passport");
const LoaclStrategy=require("passport-local");
const User= require("./models/user.js");
//USER ROUTE
const userRoute=require("./routes/user.js");


//for smooth render deploy loading
const url = `https://yatra-k765.onrender.com`;
const interval = 30000;
function reloadWebsite() {
    axios
        .get(url)
        .then((response) => {
        console.log("website reloded");
        })
        .catch((error) => {
        console.error(`Error : ${error.message}`);
        });
}
setInterval(reloadWebsite, interval);



// //online cloud db url
let atlasURL=process.env.ATLAS_URL;

//SETTING UP THE MONGO SESSION
const store=MongoStore.create({
    mongoUrl:atlasURL,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter: 24 * 3600 // time period in seconds
});
//error handler for mongostore
store.on("error",()=>{
    console.log("Connect mongo error ",err);
});

// SETTING UP EXPRESS SESSION MIDDLEWARE
const sessionOptions={
    store:store,//for maintaing session options we use atlas
    secret:process.env.SECRET,
    // secret:"secretcode",
    resave:false,
    saveUninitialized:true,
    //SETTING COOKIE OPTIONS FOR SESSION_ID cookie
    cookie:{ //the session id is saved till the setted time in this cookie options  
        expires:Date.now()+ 7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly: true
    }
};
app.use(session(sessionOptions));//using express sessions



//setting up the required modules
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));        
app.use(express.static(path.join(__dirname,"public")));
//SETUP EJS MATE
app.engine("ejs",ejsMate);


//connecting to our DB
let mongoURL="mongodb://127.0.0.1:27017/wonderlust";
// let atlasURL=process.env.ATLAS_URL; //also ussed previously to store session details

async function main(){
    await mongoose.connect(atlasURL);
    // await mongoose.connect(mongoURL);
}
main()
.then((res)=>{
    console.log("Database is connected succesfully");
})
.catch((err)=>{
    console.log("Error aya: ",err);
});

//starting our server
app.listen(8080,()=>{
    console.log("Server is started successfully");
});





//CONFIGURING PASSPORT SESSION
//initilize and session track
app.use(passport.initialize());
app.use(passport.session());
//making filter using localStrategy; bad me login time authentication me use hoga from userRoute -> local authenticator
passport.use(new LoaclStrategy(User.authenticate()));
//serialize and deserialize user i.e. save and unsave
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// SETTING UP CONNECT FLASH
app.use(flash());

app.use((req,res,next)=>{
    res.locals.succMsg=req.flash("success");//extracting flash message
    res.locals.errMsg=req.flash("error");//extracting flash message
    //should be defined after the passport defination -> as req.user is maintained by passport
    res.locals.currUser=req.user || null;//to track curr user is logged in or not in curr session
    // console.log(res.locals.succMsg);
    // console.log(res.locals.errMsg);
    // console.log(res.locals.currUser);
    next();
});

//ROUTE FOR CREATING DEMO USER
app.get("/demouser", async(req,res)=>{
    //make fakeuser document with some credentials
    const fakeUser= new User({
        email:"rohitrahuldey@gmail.com",
        username:"RohitRahulDey"
    });

    //saving document data to collection using register with a specific password and also the salt is implemented in schema directly
    const newUser=await User.register(fakeUser,"helloworld");
    res.send(newUser);
});


//SETTIIG EXPRESS ROUTES -> route shifting
app.use("/listings",listingRoute); //"/listings" starting route pe aane wale har req ko  listings route obj handle krega
app.use("/listings/:id/reviews",reviewRoute);//review route manage
app.use("/",userRoute);

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

//REVIEW VALIDTIONS
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

//routes -> now no need these "/listings" stated route handeling in index.js as this route is handeled by our listings route obj in listing.js -> all the routes stare=ted with "/listings"
// //index route
// app.get("/listings",wrapAsync(async(req,res)=>{
//     const listings=  await Listing.find();
//     // console.log(listings);
//     res.render("Listings/index.ejs",{listings});
// }));



//create route
//new 
// app.get("/listings/new",wrapAsync((req,res)=>{
//     res.render("listings/new.ejs");
// }));
// //add to DB
// app.post("/listings", validateListing, wrapAsync(async(req,res,next)=>{ //using wrap async for handling our errors AND if validateListing is passed then only out next middle ware fn is executed or err will be thrown to the next error handling middlewares
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

//     await newListing.save() //isme error aane pe catch block me direct catch hoga
//     // .then((res)=>{
//     //     console.log("data added");
//     // })
//     // .catch((err)=>{
//     //     console.log("error aya ",err);
//     // })
//     res.redirect("/listings");
// }));



// //show route
// app.get("/listings/:id",wrapAsync(async(req,res)=>{
//     let {id}= req.params;
//     const listing= await Listing.findById(id).populate("reviews");//we use populate so that we got all the reviews of the listing with details
//     console.log(listing);
//     res.render("Listings/show.ejs",{listing});
// }));


//REVIEW ROUTE
//save review route
// app.post("/listings/:id/reviews",validateReview, wrapAsync(
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
// app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
//     let {id,reviewId}=req.params;
//     await Review.findByIdAndDelete(reviewId);//deleting reviews from reviews collection

//     await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});//deleting review IDs saved in a particular listing.reviews array

//     res.redirect(`/listings/${id}`);
// }));


//edit route
// app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
//     let {id}= req.params;
//     const listing= await Listing.findById(id);
//     res.render("Listings/edit.ejs",{listing});
// }));
// //update
// app.put("/listings/:id", validateListing, wrapAsync(async(req,res)=>{
//     if(!req.body.listing){
//         next(new ExpressError(400,"Please send a valid listing"));
//     }
//     const{id}=req.params;
//     //getting data obj of form from req body
//     const listing=req.body.listing;
//     console.log(listing);
//     await Listing.findByIdAndUpdate(id,{...listing});
//     res.redirect(`/listings/${id}`);
// }));



// //delete route
// app.delete("/listings/:id",wrapAsync(async(req,res)=>{
//     const {id}=req.params;
//     let deletedListing= await Listing.findByIdAndDelete(id);
//     console.log(deletedListing);
//     res.redirect("/listings");
// }));


//checking
app.use("/testing",(req,res)=>{
    const newListing= new Listing({
        title:"My villa",
        desc:"This is a villa beside sea side",
        image:"https://unsplash.com/photos/houses-surrounded-with-plants-vbSRUrNm3Ik",
        price:3000,
        location:"Goa",
        country:"India"
    });
    newListing.save()
    .then((res)=>{
        console.log(res);
    })
    .catch((err)=>{
        console.log("error aya ",err);
    });

    res.send("Saved successfully");
});

// app.use("/",(req,res)=>{
//     res.send("ALL well");
// });




//ERRORS

//ERROR HANDLING MIDDLEWARES
app.all("*",(req,res,next)=>{//upr koi bhi orute me catch na homne pe yha aiyaga and error throw hoga jo next error handler me catch hoga
    // throw new ExpressError(400,"page not found");
    //OR
    next(new ExpressError(400,"page not found"));
});
app.use((err,req,res,next)=>{//error handler
    // console.log(err.name);
    let {status=500,message="some error occurs"}=err;
    res.status(status).render("error.ejs",{err});
    // res.status(status).send(message);
});