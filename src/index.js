import dotenv from 'dotenv';
dotenv.config();
import connectDB from "./db/index.js";


connectDB()


/*import express from "express"
const app = express()

app.get('/', (req, res) => {
    res.send('Hello, World!');
  });

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