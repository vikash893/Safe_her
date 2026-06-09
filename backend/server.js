const dotenv = require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const womenRouter = require('./routers/women');
const volunteerRouter = require('./routers/volunteer');

const app = express(); 

const port = 8000 ; 

// middleware 
app.use(express.json());
app.use(cors()); 
app.use("/uploads", express.static("uploads"));


// routers 
app.use("/api/auth" , womenRouter);
app.use("/api/volunteers", volunteerRouter);


// database connection
connectDB();

app.listen(port , ()=> {
    console.log(`Server is running on the port ${port}`);
})