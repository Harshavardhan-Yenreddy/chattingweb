import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import { connectDB } from './lib/db.js';
import { ENV } from './lib/env.js';
const app = express();
const __dirname = path.resolve();
const Port=ENV.PORT||3000;
app.use(express.json());//request body parsing middleware

app.use("/api/auth",authRoutes);
app.use("/api/messages",messageRoutes);
//deployment
if(ENV.NODE_ENV==="production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")));
    app.get("*",(req,res)=>{
        res.sendFile(path.join(__dirname,"../frontend/dist/index.html"));
    });
}
app.listen(Port,()=> {
    console.log(`server is running on port ${Port}`)
    connectDB();
});
