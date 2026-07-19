const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");
const axios = require("axios");
let mapToken = process.env.MAP_TOKEN;

module.exports.showIndex = async (req, res) => {
    const listings = await Listing.find();
    res.render("Listings/index.ejs", { listings });
};

module.exports.serveNewForm = (req, res) => {
    res.render("Listings/new.ejs");
};

module.exports.saveNewListing = async (req, res, next) => {
    if (!req.body.listing) {
        return next(new ExpressError(400, "Please send a valid listing"));
    }
    if (!req.file) {
        return next(new ExpressError(400, "Please upload an image"));
    }

    //using maptiler api for converting place to coordinates
    //NOTE: the API key here was previously hardcoded in this file and committed to git history.
    //It has been switched to process.env.MAP_TOKEN - the old hardcoded key should be treated as
    //leaked and rotated in the MapTiler dashboard regardless of this fix.
    let placeName = req.body.listing.location + ", " + req.body.listing.country;
    const mapUrl = `https://api.maptiler.com/geocoding/${encodeURIComponent(placeName)}.json?key=${mapToken}`;

    let geometry;
    try {
        const response = await axios.get(mapUrl);
        const feature = response.data.features && response.data.features[0];
        if (!feature) {
            req.flash("error", "Could not locate that place. Please check the location/country.");
            return res.redirect("/listings/new");
        }
        geometry = feature.geometry;
    } catch (err) {
        req.flash("error", "Location lookup failed. Please try again.");
        return res.redirect("/listings/new");
    }

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url: req.file.path, filename: req.file.filename };
    newListing.geometry = geometry;

    await newListing.save();

    req.flash("success", "New Listing Created");
    res.redirect("/listings");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews" }).populate("owner");
    if (!listing) {
        req.flash("error", "The listing doesn't exist");
        return res.redirect("/listings");
    }
    res.render("Listings/show.ejs", { listing });
};

module.exports.serveEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "The listing doesn't exist");
        return res.redirect("/listings");
    }

    //COMPRESSING THE IMAGE FOR PREVIEWING USING CLOUDINARY API
    let originalImageUrl = listing.image.url;
    let compressedImageUrl = originalImageUrl.replace("/upload", "/upload/w_300");
    res.render("Listings/edit.ejs", { listing, compressedImageUrl });
};

module.exports.saveEditListing = async (req, res, next) => {
    if (!req.body.listing) {
        return next(new ExpressError(400, "Please send a valid listing"));
    }
    const { id } = req.params;
    const listing = req.body.listing;

    //{new:true} is required so we get back the UPDATED document, not the pre-update one.
    //Previously the pre-update doc was returned, then had .image set + .save() called on it,
    //which could overwrite the just-applied text field updates with stale values.
    const updatedListing = await Listing.findByIdAndUpdate(id, { ...listing }, { new: true, runValidators: true });
    if (!updatedListing) {
        req.flash("error", "The listing doesn't exist");
        return res.redirect("/listings");
    }

    if (req.file) {
        updatedListing.image = { url: req.file.path, filename: req.file.filename };
        await updatedListing.save();
    }

    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
};
