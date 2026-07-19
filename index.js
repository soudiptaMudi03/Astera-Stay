//USING DOTENV FOR ACCESSING OUR CLOUD CREDENTIALS
if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

//requiring all the needed modules
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
//EJS MATE -> to apply boiler plate styling across diff ejs files
const ejsMate = require("ejs-mate");
//ERROR HANDLER REQUIRED
const ExpressError = require("./utils/ExpressError.js");
//ROUTES
const listingRoute = require("./routes/listing.js");
const reviewRoute = require("./routes/review.js");
const userRoute = require("./routes/user.js");
//USING EXPRESS SESSION
const session = require("express-session");
//USING MONGO SESSION STORE
const MongoStore = require("connect-mongo");
//USING FLASH
const flash = require("connect-flash");
//USING PASSPORT
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

//FAIL FAST IF REQUIRED ENV VARS ARE MISSING (this is almost certainly why the app has been crashing:
//the project's .env file was found empty, so ATLAS_URL/SECRET/CLOUD_*/MAP_TOKEN were all undefined)
const REQUIRED_ENV_VARS = ["ATLAS_URL", "SECRET", "CLOUD_NAME", "CLOUD_API_KEY", "CLOUD_API_SECRET", "MAP_TOKEN"];
const missingEnvVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
if (missingEnvVars.length) {
    console.error(`Missing required environment variable(s): ${missingEnvVars.join(", ")}`);
    console.error("Add them to your .env file (see .env.example) before starting the server.");
    process.exit(1);
}

const atlasURL = process.env.ATLAS_URL;
const PORT = process.env.PORT || 8080;

//SETTING UP THE MONGO SESSION STORE
const store = MongoStore.create({
    mongoUrl: atlasURL,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600, // time period in seconds
});
//error handler for mongostore (previously referenced an undefined `err`, which throws as soon as
//this fires - now correctly receives the error from the event)
store.on("error", (err) => {
    console.log("Session store error: ", err);
});

// SETTING UP EXPRESS SESSION MIDDLEWARE
const sessionOptions = {
    store: store, //for maintaining session we use mongo atlas
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

//setting up the required modules
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
//SETUP EJS MATE
app.engine("ejs", ejsMate);

app.use(session(sessionOptions));

//CONFIGURING PASSPORT SESSION
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// SETTING UP CONNECT FLASH
app.use(flash());

app.use((req, res, next) => {
    res.locals.succMsg = req.flash("success");
    res.locals.errMsg = req.flash("error");
    //should be defined after the passport definition -> as req.user is maintained by passport
    res.locals.currUser = req.user || null;
    next();
});

//SETTING EXPRESS ROUTES -> route shifting
app.use("/listings", listingRoute);
app.use("/listings/:id/reviews", reviewRoute);
app.use("/", userRoute);

//404 HANDLER -> anything that fell through every route above lands here
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

//CENTRALIZED ERROR HANDLER
app.use((err, req, res, next) => {
    let { status = 500, message = "Something went wrong" } = err;
    if (!err.message) err.message = message;
    res.status(status).render("error.ejs", { err });
});

//CONNECT TO THE DATABASE FIRST, ONLY START LISTENING ONCE IT SUCCEEDS.
//Previously app.listen() ran unconditionally and immediately, regardless of whether Mongo
//ever connected, so the server would appear "up" while every DB-backed route failed.
async function main() {
    await mongoose.connect(atlasURL);
}

main()
    .then(() => {
        console.log("Database is connected successfully");
        app.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Database connection error: ", err);
        process.exit(1);
    });
