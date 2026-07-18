//requiring all the needed modules
const express=require("express");
const app= express();
const mongoose=require("mongoose");
const Listing=require("../models/listing.js");
const data=require("./data.js");


//connecting to our DB
let mongoURL="mongodb://127.0.0.1:27017/wonderlust";
async function main(){
    await mongoose.connect(mongoURL);
}
main()
.then((res)=>{
    console.log("Database is connected succesfully");
})
.catch((err)=>{
    console.log("Error aya: ",err);
});

const insertListings= async ()=>{
    await Listing.deleteMany({});
    //adding owner for each listing
    data.listings=data.listings.map((listing)=>({...listing,owner:"65b0b7979a12b3da7c802baf"}));
    await Listing.insertMany(data.listings);
    console.log("Data has initilized")
}

insertListings();

