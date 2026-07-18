const mongoose=require("mongoose");
const schema= mongoose.Schema;
const Review= require("./review.js");

let listingSchema= new schema({
    title:{
        type:String,
        required:true
    },
    desc:String,
    image:{
        url:String,
        filename: String
        // type:String,
        // default:"https://images.unsplash.com/photo-1416331108676-a22ccb276e35?q=80&w=1767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        // set: (v)=>v==="" ? "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?q=80&w=1767&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" : v,
    },
    price:Number,
    location:String,
    country:String,
    reviews:[{//tracks all the reviews of this post
        type: schema.Types.ObjectId,
        ref:"Review"
    }],
    owner:{//track the owner of this post
        type:schema.Types.ObjectId,
        ref:"User"
    },
    geometry:{
        type:{
            type:String,
            enum:["Point"],
            required:true
        },
        coordinates:{
            type:[Number],
            required:true
        }
    }
});

//SETTING UP DELETION MIDDELEWARE ON LISTING SCHEMA -> these middlewares are also exported to out main js file with our Exported model
listingSchema.post("findOneAndDelete", async(listing)=>{
    if(listing){
    await Review.deleteMany({_id:{$in:listing.reviews}});
    }
});


const Listing= mongoose.model("Listing",listingSchema);

module.exports=Listing;