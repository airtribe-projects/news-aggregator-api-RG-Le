const userModel = require('../models/userModel');

class AuthController {
    async registerUser(req, res) {
        try {
            const { username, password } = req.body;
            console.log('Registering user:', username, password);

            // Logic to register user
            if (!username || !password) {
                return res.status(400).json({ error: 'Username and password are required' });
            }
            
            userModel.createUser({ username, password })
                .then(result => {
                    return res.send(result)
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
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ error: 'Username and password are required' });
            }
            console.log('Login attempt for user:', username);
            
            userModel.loginUser({ username, password })
                .then(result => {
                    return res.send(result);
                })
                .catch(error => {
                    console.log("Error while logging in user:", error);
                    return res.status(500).json({ error: 'Error logging in user' });
                })
                
        } catch (error) {
            return res.status(500).json({ error: 'Error logging in user' });
        }
    }
}

module.exports = new AuthController(); 