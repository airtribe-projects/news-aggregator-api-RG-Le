const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { writeJSONFileSync, readJSONFileSync } = require('../utils/file_utils');
const userSchema = require("../models/schema/userSchema");
const UserSchema = require('../models/schema/userSchema');

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
    static findUser(email) {
        try {
            if (!email) {
                throw new Error('Username is required');
            }

            // Read existing users
            const users = this.readUsers();

            // Check if user exists
            return users.find(u => u.email === email);
        } catch (error) {
            console.error('Error finding user:', error);
        }
    };

    // Method to Create a User
    async createUser(userData) {
        try{
            // Logic to create user in the database
            console.log('Creating user:', userData.email);
            
            // Check if user already exists 
            const existingUser = UserModel.findUser(userData.email);
            if (existingUser) {
                console.error('User with username already exists:', userData.name);
                return {
                    message: 'User already exists',
                    status: 409
                }
            }

            // Adding a new user
            const users = UserModel.readUsers();
            const hashedPassword = await bcrypt.hash(userData.password, 10) 
            try {
                const newUser = new UserSchema({
                    username: userData.name,
                    email: userData.email,
                    password: hashedPassword,
                    preferences: userData.preferences || [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
                // Write the new user to DB
                writeJSONFileSync(userDBPath, [...users, newUser]);
                
                return {
                    message: 'User created successfully',
                    status: 200,
                }

            } catch (error) {
                return {
                    message: error.message,
                    status: 400
                }
            }
        
        } catch (error) {
            console.log("Error creating user:", error);
            throw error
        }
    
    }

    // Method to Login and Verify a User
    async loginUser(userData) {
        try {
            // Check if valid user data is provided
            if (!userData || !userData.email || !userData.password) {
                throw new Error('Invalid User Data');
            }

            // Find If User Exists
            const user = UserModel.findUser(userData.email);
            if (!user) {
                console.log('No User Found with Username:', userData.username);
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
            const token = jwt.sign({ email: user.email}, jwtSecret, { expiresIn: '1h' }); 
            
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
    getUserPreferences(email) {
        try {
            console.log('Getting Preferences for user:', email);
            if (!email) {
                throw new Error('No Username Found!!');
            }

            // Get User Details
            const user = UserModel.findUser(email);
            if (!user) {
                return {
                    message: 'User not found',
                    status: 404
                }
            }

            // Read User Preferences
            if (!user.preferences || Object.keys(user.preferences).length === 0) {
                console.log('No preferences set for the user');
                return {
                    message: 'No preferences set for user',
                    preferences: [],
                    status: 200
                }
            }

            console.log("User Preferences:", user.preferences);
            return {
                message: 'User preferences fetched successfully',
                preferences: user.preferences,
                status: 200
            }

        } catch (error) {
            console.log('Error getting user preferences:', error);
            return {
                message: 'Internal Server Error',
                preferences: [],
                status: 500
            }
        }
    }

    setPreferences(email, preferences) {
        if (!email || !preferences) {
            return {
                message: 'Username or Preferences Not Found!',
                status: 400
            }
        }

        try {
            console.log('Updating Preferences for user:', email);
            // Get User Details
            const user = UserModel.findUser(email);
            if (!user) {
                return {
                    message: 'User not found',
                    status: 404
                }
            }

            // Update User Preferences
            user.preferences = preferences;
            const users = UserModel.readUsers();
            const updatedUsers = users.map(u => u.email === email ? user : u); // Update that particular user
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