import User from "../models/User.js";
import{ genrateToken } from "../lib/utils.js";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import{ENV} from "../lib/env.js";
export const signup =async(req, res) => {
    const { fullName, email, password } = req.body;
    try{
        if(!fullName || !email || !password){
            return res.status(400).json({ message: "All fields are required" });
        }
        if(password.length < 6){
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }
        // check if email is vaild
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({ message: "Invalid email address" });
        }
        const user= await User.findOne({ email });
        if(user){
            return res.status(400).json({ message: "Email already exists" });
        }
//1234->$dnj_ssrhs
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);
const newUser=new User({
    fullName,
    email,
    password:hashedPassword,
})
if(newUser){
    const savedUser=await newUser.save();
    genrateToken(savedUser._id, res);
    res.status(201).json({
        _id:newUser._id,
        fullName:newUser.fullName,
        email:newUser.email,
        profilepic:newUser.profilepic,
    });
    //send welcome user email
    try{
        await sendWelcomeEmail(savedUser.email,savedUser.fullName,ENV.CLIENT_URL);
    }catch(error){
        console.log("error in sending welcome email:",error);
    }
}else{
    res.status(400).json({ message: "Invalid user data" });
}
}catch (error) {
    console.log("error in signup controller", error);
    res.status(500).json({ message: "internal Server error" });
}
}