const mongoose = require('mongoose'); 

// connectDB
const connectDB = async(req ,res)=> {
    try {
        mongoose.connect('mongodb://localhost:27017/ws');
        console.log('Database connect sucessfully');
    } catch (error) {
        console.error('database connection error' , error);
    }
}

module.exports = connectDB ;