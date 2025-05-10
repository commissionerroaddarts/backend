import mongoose from 'mongoose';
import bcrypt from "bcryptjs";
import { validateURL } from '../utils/helper.js';

const { Schema, model } = mongoose;



const userSchema = new Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    dob: { type: Date },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: [true, 'Email already exists'],
        lowercase: true,
        validate: {
            validator: v => /^(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v),
            message: "Invalid Email"
        }
    },
    password: {
        type: String,
        minlength: [8, 'Password must be at least 8 characters long']
    },
    username: { type: String, unique: [true, "Username already exists"] },
    phone: {
        type: String,
        validate: {
            validator: v => /^\+?[1-9]\d{1,14}$/.test(v),
            message: "Invalid phone number format"
        }
    },
    address: {
        state: String,
        city: String,
        country: String,
        zipcode: String
    },
    socials: { type: Object },
    profileImg: {
        type: String,
        // validate: {
        //     validator: validateURL,
        //     message: 'Invalid URL format for profile image'
        // }
    },
    status: {
        type: String,
        enum: {
            values: ['verified', 'unverified', 'deleted'],
            message: 'invalid status'
        },
        default: 'unverified'
    },
    role: {
        type: String,
        enum: ['admin', 'user', 'owner'],
        default: 'user'
    },
    stripeSubscriptionId: {
        type: String,
    },
    refreshToken: { type: String, select: false }
}, { timestamps: true });


userSchema.pre('save', async function (next) {
    try {
        // Hash password if modified
        if (this.password && this.isModified('password')) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }

        // Username Handling
        if (this.isNew || this.isModified('username')) {
            if (this.username) {
                // User provided username → check uniqueness
                const exists = await mongoose.models.User.findOne({ username: this.username, _id: { $ne: this._id } });
                if (exists) {
                    return next(new Error('Username already exists.'));
                }
            } else {
                // Auto-generate username
                let baseUsername = `${this.firstname.toLowerCase()}${this.lastname.toLowerCase()}`;
                let username = baseUsername;
                let exists = await mongoose.models.User.findOne({ username });

                while (exists) {
                    const randomNum = Math.floor(1000 + Math.random() * 9000);
                    username = `${baseUsername}${randomNum}`;
                    exists = await mongoose.models.User.findOne({ username });
                }

                this.username = username;
            }
        }

        next();
    } catch (err) {
        console.error(err.message);
        next(err);
    }   
});

const User = model('User', userSchema);

export default User;
