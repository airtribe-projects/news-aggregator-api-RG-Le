const validator = require('validator');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw Error("JWT SECRET NOT FOUND!!");
}

class AuthController {
    static validateCreds(email, password) {
        const passwordLength = 8;
        if (!email || validator.isEmail(email) === false) {
            return { valid: false, message: 'Invalid email format' };
        }
        if (!password || password.length < passwordLength) {
            return { valid: false, message: `Password must be at least ${passwordLength} characters` };
        }
        return { valid: true };
    }

    async registerUser(req, res) {
        try {
            const { name, email, password, preferences = [] } = req.body;
            console.log('Registering user with email:', email);

            // Check if all required fields are provided
            if (!email || !name || !password) {
                return res.status(400).json({ error: 'Missing Required Field! Email, Name, and Password are required' });
            }

            // Validate the input data            
            const validation = AuthController.validateCreds(email, password);
            if (!validation.valid) {
                // ideally an exception should be raised and should be handled in the error block
                return res.status(400).json({ error: validation.message })   
            }

            // Check if User Exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                console.log("User Already Exists");
                return res.status(400).json({ error: "User with EMAIL Already Exists! "})
            }

            // Create User
            const salt = bcrypt.genSaltSync(SALT_ROUNDS);
            const hashedPassword = bcrypt.hashSync(password, salt);
            const user = new User({ name, email, password: hashedPassword, preferences });
            await user.save();
            
            return res.status(200).json({ 
                message: "User registered Successfully!", 
                details: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    preferences: user.preferences
                } 
            });
        } catch (error) {
            console.error('Error registering user:', error);
            return res.status(500).json({ error: 'Error registering user' });
        }
    }

    async loginUser(req, res) {
        try {       
            // Logic to login user
            const { email, password } = req.body;

            // Validate Fields
            if (!email || !password) {
                return res.status(400).json({ error: 'Email and Password are required' });
            }
            console.log('Login attempt for user:', email);
            
            // Find the User and Compare Passwords
            const user = await User.findOne({ email });
            if (!user) {
                console.log("User Not Found!");
                return res.status(404).json({ error: 'User Not Found!' });
            }
            
            const isSamePassword = bcrypt.compareSync(password, user.password);
            console.log("Password Match Status:", isSamePassword);
            
            if (!isSamePassword) {
                return res.status(401).json({ error: "Invalid Password!" });
            }

            // Create a JWT Token
            const jwt_token = jwt.sign(
                { id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "1hr" }
            );
            return res.status(200).json({ 
                message: "Login Attempt Successful!", 
                token: jwt_token 
            });
        } catch (error) {
            console.log('Error logging in user:', error);
            return res.status(500).json({ error: 'Error logging in user' });
        }
    }
}

module.exports = new AuthController(); 