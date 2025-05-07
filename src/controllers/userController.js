import bcrypt from 'bcryptjs';
import User from '../model/userModel.js';
import jwt from 'jsonwebtoken';

export const signupUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User Email already exists' });
        }

        const existingUserName = await User.findOne({ username });
        if (existingUserName) {
            return res.status(400).json({ message: 'User Name already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);


        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        // Save user to database
        const savedUser = await newUser.save();

        const userResponse = {
            _id: savedUser._id,
            username: savedUser.username,
            email: savedUser.email,
            password: savedUser.password,
            accessRole: savedUser.accessRole
        };




        res.status(201).json({
            message: 'User created successfully',
            user: userResponse
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};



export const getAllUser = async (req, res) => {

    try {
        const users = await User.find().select('_id username email accessRole');

        const userResponse = users.map(user => ({
            _id: user._id,
            username: user.username,
            email: user.email,
            accessRole: user.accessRole
        }));



        res.status(200).json(userResponse)

    } catch (error) {
        res.status(500).json({ message: "Server Error" })

    }

}

export const getUSerByID = async (req, res) => {


    try {

        const user = await User.findById(req.params.id).select('_id username email accessRole')

        if (!user) return res.status(404).json({ message: "User not found" })

        res.status(200).json({ user });

    } catch (error) {
        res.status(500).json({ message: "Server Error" })

    }

}


export const updateUser = async (req, res) => {
    try {


        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 10)

        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).select('_id username email accessRole');
        if (!updatedUser) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'User updated', user: updatedUser });

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });

    }

}



export const deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({
            message: 'User deleted',
            deleteUser
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};



export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }



        // Compare entered password with stored hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Create a JWT token
        const token = jwt.sign(
            { userId: user._id, username: user.username, accessRole: user.accessRole },
            process.env.JWT_SECRET_KEY, // Secret key (make sure to set this in your .env file)
            { expiresIn: '7d' } // Token expiration time
        );

        // Send response with the token
        res.status(200).json({
            message: 'Login successful',
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
