//USING CLOUDILARY FOR CONFIGURING OUR CLOUD
const cloudinary=require("cloudinary").v2;
//USING MULTER STORAGE CLOUDINARY FOR DEFINING STORAGE FOR CLOUD
const {CloudinaryStorage}=require("multer-storage-cloudinary");

//CONFIGURING CLOUDINARY 
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

//DEFINING STORAGE 
const storage= new CloudinaryStorage({
    cloudinary: cloudinary,//iss cloudinary storage pe ssave krega
    params:{
        folder:"WonderLust_DEV",
        allowerdFormets:["png","jpg","jpeg"]
    }
});

module.exports={cloudinary,storage};
