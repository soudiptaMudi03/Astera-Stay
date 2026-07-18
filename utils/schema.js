const joi=require("joi");

const validSchema= joi.object({
    listing: joi.object({
        title: joi.string().required(),
        desc: joi.string().required(),
        // image: joi.string().allow("",null),
        price: joi.number().required().min(0),
        location: joi.string().required(),
        country: joi.string().required(),
    }).required()
});

const validReview= joi.object({
    review: joi.object({
        comment:joi.string().required(),
        rating:joi.number().required().min(1).max(5)
    }).required()
})

module.exports={validSchema,validReview};
// module.exports=validReview; //we can,t send two different thing ussing module exports like this istead we have to send a object whith different attributes