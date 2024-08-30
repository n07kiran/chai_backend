import dotenv from 'dotenv';
dotenv.config({
    path:'./env'
});
import connectDB from "./db/index.js";


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