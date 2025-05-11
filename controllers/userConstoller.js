import sendMail from '../config/mail.js';
import { cookieOptions } from '../constants/cookieOptions.js';
import { OTP } from '../constants/emailTemplets.js';
import User from '../models/User.js';
import { deleteImage, uploadToCloudinary } from '../services/cloudinary.js';
import { cleanFields, generateAccessToken, generateRefreshToken } from '../utils/helper.js';
import mongoose from 'mongoose';

// Get all users with pagination
export const getAllUsers = async (req, res) => {
    try {
        const { fields = '', page = 1, limit = 10 } = req.query;
        const projection = cleanFields(fields) + ' -password -__v';
        const skip = (page - 1) * limit;

        const users = await User.find().select(projection).skip(skip).limit(limit);
        const totalItems = await User.countDocuments();
        const totalPages = Math.ceil(totalItems / limit);

        res.status(200).json({
            data: users,
            totalItems,
            totalPages,
            page,
            limit,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Get Single User
export const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        // const user = await User.findById(req.params.id).select('-password -__v');
        const user = await User.findOne({
            $or: [
                { _id: mongoose.Types.ObjectId.isValid(id) ? id : null },
                { username: id }
            ]
        }).select('-password -__v');

        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update User
export const updateUser = async (req, res) => {
    try {
        const {
            firstname,
            lastname,
            gender,
            dob,
            address: {
                state,
                city,
                country,
                zipcode
            },
            email,
            phone,
            username,
            socials,
            profileImg
        } = req.body;
        const { id } = req.user;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.firstname = firstname || user.firstname;
        user.lastname = lastname || user.lastname;
        user.gender = gender || user.gender;
        user.dob = dob || user.dob;
        user.phone = phone || user.phone;
        user.username = username || user.username;
        user.profileImg = profileImg || user.profileImg;
        
        user.address = {
            state: state || user.address.state,
            city: city || user.address.city,
            country: country || user.address.country,
            zipcode: zipcode || user.address.zipcode,
        }
        
        user.socials = {
            ...user.socials, // existing socials
            ...socials       // new socials
        };
        
        const isEmailChanged = email && email !== user.email;
        if (isEmailChanged) {
            user.email = email || user.email;
        }
        const savedUser = await user.save();
        
        if (username || email) {
            const token = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);
            user.refreshToken = refreshToken;

            await user.save();
            res.cookie('token', token, cookieOptions)
                .cookie('refreshToken', refreshToken, cookieOptions);
        }

        if (isEmailChanged) {
            const tokenForOtp = generateAccessToken(user);
            sendMail(OTP(user.email, user.firstname, tokenForOtp))
        }

        const userObj = savedUser.toObject();
        delete userObj.password;
        delete userObj.__v;
        delete userObj.refreshToken;

        res.status(200).json({ message: 'User updated successfully', data: userObj });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete User
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const imageDeleted = await deleteImage(user.profileImg);
        res.status(200).json(imageDeleted);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



export const updateProfileImage = async (req, res) => {
    try {
        const file = req.file;
        const userId = req.user.id;

        if (!file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const public_id = `user_profiles/profile_${userId}`;
        const imageUrl = await uploadToCloudinary(file.buffer, public_id);

        console.log('Image URL:', imageUrl);
        await User.findByIdAndUpdate(userId, { profileImg: imageUrl });

        res.status(200).json({
            success: true,
            message: 'Profile image uploaded successfully',
            profileImg: imageUrl,
        });

    } catch (error) {
        console.error('Upload Profile Error:', error.message);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
}
