const User = require('../models/user.js');
const { hashPassword,comparePassword } = require('../middlewares/auth.js');
const jwt = require('jsonwebtoken');



const test = (req,res)=>{
    res.send("Auth route working");
}

const registerUser = async (req,res)=>{
    try {
        const {firstName,lastName,email,password,role} = req.body;
        // check if name was entered
        if(!firstName || !lastName){
            return res.status(400).json({message:"First and last name are required"});
        }
        // check if password were entered
        if(!password || password.length<8){
            return res.status(400).json({message:"Password is required and should be at least 8 characters long"});
        }

        // check if email was entered
        const exist=await User.findOne({email});
        if(exist){
            return res.json({message:"Email is taken Already"});
        }
        const hashedPassword=await hashPassword(password);
        const user=await User.create({
            name:{first:firstName,last:lastName},
            email,
            password: hashedPassword,
            role
        });
        res.status(201).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Server error during registration"});
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;   
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "No user found" });
        }
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid  password" });
        }
        // res.status(200).json({ message: "Login successful", user });
        jwt.sign({email: user.email, id: user._id,name: user.name}, process.env.JWT_SECRET, {expiresIn: '1d'}, (err, token) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: "Error generating token" });
            }
            res.cookie('token', token).status(200).json({ message: "Login successful", user, token });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error during login" });
    }
}

const getProfile = async (req, res) => {
    const {token}=req.cookies;
    if(token){
        jwt.verify(token,process.env.JWT_SECRET,{},(err,user)=>{
            if(err) throw err;
            res.json(user)
        })
    }else{
        res.json(null)
    }
}


module.exports = {test, registerUser , loginUser, getProfile};