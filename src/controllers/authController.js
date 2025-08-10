const validator = require('validator');
const userModel = require('../models/userModel');

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
                return res.status(400).json({ error: 'Missing Required Field! Email, Username, and Password are required' });
            }

            // Validate the input data            
            const validation = AuthController.validateCreds(email, password);
            if (!validation.valid) {
                return res.status(400).json({ error: validation.message })   
            }

            return userModel.createUser({ email, name, password, preferences })
                .then(result => {
                    return res.status(result.status).json({ message: result.message } )
                })
                .catch(error => {
                    console.error('Error creating user: ', error);
                    return res.status(500).json({ error: 'Error creating user' });
                })
        
        } catch (error) {
            console.error('Error registering user:', error);
            return res.status(500).json({ error: 'Error registering user' });
        }
    }

    async loginUser(req, res) {
        try {       
            // Logic to login user
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email and Password are required' });
            }
            console.log('Login attempt for user:', email);
            
            userModel.loginUser({ email, password })
                .then(result => {
                    return res.status(result.status).json({ message: result.message, token: result.token });
                })
                .catch(error => {
                    console.log("Error while logging in user:", error);
                    return res.status(500).json({ error: 'Error logging in user' });
                })
                
        } catch (error) {
            console.log('Error logging in user:', error);
            return res.status(500).json({ error: 'Error logging in user' });
        }
    }
}

module.exports = new AuthController(); 