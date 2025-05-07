import mongoose from 'mongoose';


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    },
    password: {
        type: String,
        required: true,
    },
    accessRole: {
        type: String,
        enum: ['User', 'Admin', 'Superadmin'],
        default: 'Admin'
    }
});



const User = mongoose.model('User', userSchema);

export default User;
