//requiring all the needed modules
if (process.env.NODE_ENV != "production") {
    require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
}
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const data = require("./data.js");

//connecting to the same DB the app uses (ATLAS_URL from .env), not a hardcoded local Mongo URL
const atlasURL = process.env.ATLAS_URL;

async function main() {
    if (!atlasURL) {
        throw new Error("ATLAS_URL is not set. Add it to your .env file before running the seed script.");
    }
    await mongoose.connect(atlasURL);
}

const insertListings = async () => {
    await Listing.deleteMany({});
    //adding owner + a placeholder geometry for each listing (the schema requires geometry;
    //the raw seed data in data.js has no coordinates, so inserting it as-is fails validation).
    //Replace OWNER_ID below with a real User _id from your database before seeding.
    const OWNER_ID = process.env.SEED_OWNER_ID || "65b0b7979a12b3da7c802baf";
    const listingsWithMeta = data.listings.map((listing) => ({
        ...listing,
        owner: OWNER_ID,
        geometry: {
            type: "Point",
            coordinates: [77.209, 28.6139], // placeholder coordinates; update per-listing as needed
        },
    }));
    await Listing.insertMany(listingsWithMeta);
    console.log(`Seeded ${listingsWithMeta.length} listings`);
};

main()
    .then(() => insertListings())
    .then(() => {
        console.log("Data has initialized");
        return mongoose.connection.close();
    })
    .catch((err) => {
        console.error("Seeding failed: ", err);
        process.exit(1);
    });
