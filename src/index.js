import dotenv from 'dotenv';
dotenv.config({
    path:'./env'
});

import connectDB from "./db/index.js";
import express from 'express';

const app = express()

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000 , () => {
        console.log(`App listening on Port ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MONGO db connection failed!!!",err);
})

/*import express from "express"
import { DB_NAME } from './constants.js';
const app = express()

app.get('/', (req, res) => {
    res.send('Hello, World!');
  });

IIFE 's => ( ()=>{} )()
(async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("Error : ",error);
            throw error
        })

        app.listen(process.env.PORT , ()=>{
            console.log("App listening on PORT : ",process.env.PORT);
        })
    }catch(err){
        console.error("Error : ",err)
        throw err
    }
})()*/