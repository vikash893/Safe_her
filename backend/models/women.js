const mongoose = require('mongoose'); 

const womenSchema = new mongoose.Schema({
    // personal details 
    name : {
        type:String , 
        required : true 
    },
    phone : {
        type : String , 
        required : true 
    },
    email : {
        type : String , 
        required : true ,
        unique : true 
    }, 
    password : {
        type : String , 
        required : true 
    }, 
    alternate_number : {
         type : String , 
        required : true 
    },
    photo : {
        type : String , 
        required:true
    },
    // contact details 
    emergency_phone : {
         type : String , 
        required : true 
    },
    emergency_email : {
         type : String , 
        required : true
    },
    // location details 
    pincode : {
         type : String , 
        required : true
    }, 
    lat : {
         type : String , 
        required : true
    },
    log : {
         type : String , 
        required : true
    }
})

module.exports = mongoose.model("women" , womenSchema) ; 