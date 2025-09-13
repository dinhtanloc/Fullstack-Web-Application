
import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
	title: { type: String, required: true },
	content: { type: String, required: true },
	authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
	// Add other fields as needed
}, { 
	timestamps: true,
	collection: 'Posts' // Explicitly set collection name
});

const Post = mongoose.model('Post', postSchema, 'Posts');

export default Post;
