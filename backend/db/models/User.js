
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
	email: { type: String, required: true, unique: true },
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	refreshToken: { type: String },
	role: { type: String, enum: ['user', 'admin'], default: 'user' },
	isActive: { type: Boolean, default: true },
	lastLogin: { type: Date },
	// Add other administration fields as needed
}, { 
	timestamps: true,
	collection: 'Authentication' // Explicitly set collection name
});

const User = mongoose.model('User', userSchema, 'Authentication');

export default User;
