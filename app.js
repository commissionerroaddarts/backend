import businessRoutes from './routes/businessRoutes.js';
import promotionRoutes from './routes/promotionRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';

import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import "./config/passport.js";
import { stripeWebhookFn } from './config/stripe.js';
import bodyParser from 'body-parser';
import { errorHandler } from './middlewares/errorHandler.js';

dotenv.config();


// express setup
const app = express();


app.post('/webhook', bodyParser.raw({ type: 'application/json' }), stripeWebhookFn );


// ===== MIDDLEWARES =====
app.use(cookieParser());
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
    "http://localhost:3000", 
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URL_WWW
];


app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true); // Allow request
        } else {
            callback(new Error("Not allowed by CORS")); // Block request
        }
    },
    credentials: true, // Allow cookies to be sent
}));

// DB Connection
connectDB();



app.use(passport.initialize());


// =========================== Routes ===========================

app.get('/', (req, res) => res.json({ message: "✅ API is running... 3" }));
app.use('/api/businesses', businessRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/contactus', contactRoutes);
app.use('/api/subscription', subscriptionRoutes); 
app.use('/api/reviews', reviewRoutes); 
app.use('/api/promotion', promotionRoutes); 


// =========================== Routes ===========================


app.use((req, res, next) => {
    res.status(404).json({ message: "Route Not Found" });
});

app.use(errorHandler);

app.listen(process.env.PORT, () => {
    console.log(`✅ Server is running on port ${process.env.PORT}`);
})

export default app;
