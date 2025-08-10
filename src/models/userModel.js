const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { writeJSONFileSync, readJSONFileSync } = require('../utils/file_utils');
const { use } = require('react');

require('dotenv').config();

const userDBPath = path.join(__dirname, '../data/userDB.json');

class UserModel {
    // Method to Read Complete User Data
    static readUsers() {
        try {
            const users = readJSONFileSync(userDBPath);
            if (!users) {
                throw new Error('No users found!');
            }
            return users;
        } catch (error) {
            console.error('Error reading users:', error);
            return [];
        }
    };

    // Method to find a user by username
    static findUser(username) {
        try {
            if (!username) {
                throw new Error('Username is required');
            }

            // Read existing users
            const users = this.readUsers();

            // Check if user exists
            return users.find(u => u.username === username);
        } catch (error) {
            console.error('Error finding user:', error);
        }
    };

    // Method to Create a User
    async createUser(userData) {
        try{
            console.log('Creating user:', userData.username);
            // Logic to create user in the database
            
            if (!userData || !userData.username || !userData.password) {
                throw new Error('Invalid user data');   
            }
            
            // Check if user already exists 
            const existingUser = UserModel.findUser(userData.username);
            if (existingUser) {
                return {
                    message: 'User already exists',
                    status: 409
                }
            }

            // Adding a new user
            const users = UserModel.readUsers();
            let newUser = {
                username: userData.username,
                password: await bcrypt.hash(userData.password, 10), // Hashing the password
                preferences: {}, // Default Empty Preferences
                createdAt: new Date().toISOString(),
            }
            writeJSONFileSync(userDBPath, [...users, newUser]);

            return { message: 'User created successfully' };
        
        } catch (error) {
            console.log("Error creating user:", error);
            throw error
        }
    
    }

    // Method to Login and Verify a User
    async loginUser(userData) {
        try {
            console.log('Logging in user: ', userData.username);

            // Check if valid user data is provided
            if (!userData || !userData.username || !userData.password) {
                throw new Error('Invalid User Data');
            }

            // Find If User Exists
            const user = UserModel.findUser(userData.username);
            if (!user) {
                return {
                    message: 'User not found',
                    status: 404,
                }
            }

            // Validate Password
            const isPasswordValid = await bcrypt.compare(userData.password, user.password);
            if (!isPasswordValid) {
                return {
                    message: 'Invalid Password',
                    status: 401,
                }
            }

            // Generate JWT Token
            const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';
            const token = jwt.sign({ username: user.username}, jwtSecret, { expiresIn: '1h' }); // TODO: Get the JWT Private Key from Environment Variables
            
            return {
                message: 'User logged in successfully',
                token: token,
                status: 200,
            }
        } catch (error) {
            console.log("Error logging in user: ", error);
            return {
                message: 'Internal Server Error While Login Process',
                status: 500
            }
        }
    }

    // Method to Get User Preferences
    getUserPreferences(username) {
        try {
            console.log('Getting Preferences for user:', username);
            if (!username) {
                throw new Error('No Username Found!!');
            }

            // Get User Details
            const user = UserModel.findUser(username);
            if (!user) {
                return {
                    message: 'User not found',
                    status: 404
                }
            }

            // Read User Preferences
            if (!user.preferences || Object.keys(user.preferences).length === 0) {
                return {
                    message: 'No preferences set for user',
                    preferences: {
                        "categories": [],
                        "languages": []
                    },
                    status: 200
                }
            }

            return {
                message: 'User preferences fetched successfully',
                preferences: user.preferences,
                status: 200
            }

        } catch (error) {
            console.log('Error getting user preferences:', error);
            return {
                message: 'Internal Server Error',
                preferences: {},
                status: 500
            }
        }
    }

    setPreferences(username, preferences) {
        if (!username || !preferences) {
            return {
                message: 'Username or Preferences Not Found!',
                status: 400
            }
        }

        try {
            console.log('Updating Preferences for user:', username);
            // Get User Details
            const user = UserModel.findUser(username);
            if (!user) {
                return {
                    message: 'User not found',
                    status: 404
                }
            }

            // Update User Preferences
            user.preferences = preferences;
            const users = UserModel.readUsers();
            const updatedUsers = users.map(u => u.username === username ? user : u); // Update that particular user
            writeJSONFileSync(userDBPath, updatedUsers);

            return {
                message: 'Preferences updated successfully',
                preferences: user.preferences,
                status: 200
            }
        } catch (error) {
            console.log('Error updating user preferences:', error);
            return {
                message: 'Internal Server Error',
                status: 500
            }
        }
    }
}

module.exports = new UserModel();