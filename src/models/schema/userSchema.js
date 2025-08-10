class UserSchema {
    constructor(data) {
        // Define required fields
        this.requiredFields = ['username', 'email', 'password'];

        // Validate required fields
        for (const field of this.requiredFields) {
            if (!data[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        // Assign values
        this.username = data.username;
        this.email = data.email;
        this.password = data.password;

        // Optional fields
        this.preferences = data.preferences || [];
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }
}

module.exports = UserSchema;