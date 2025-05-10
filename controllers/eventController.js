import Event from '../models/Event.js';
import { uploadToCloudinary } from '../services/cloudinary.js';
import Interest from '../models/Interest.js';

// CREATE EVENT
export const createEvent = async (req, res) => {
    try {
        const eventData = {
            ...req.body,
            userId: req.user.id
        };

        const event = await Event.create(eventData);



        await event.save();
        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: event
        });
    } catch (err) {
        console.error('Error creating event:', err);
        next(err);
    }
};

// BULK CREATE EVENTS
export const bulkCreateEvents = async (req, res) => {
    try {
        const events = req.body;
        const result = await Event.insertMany(events);
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// GET ALL EVENTS
export const getAllEvents = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const {
            category,
            city,
            state,
            country,
            agelimit,
            status,
            search,
            sort = 'createdAt_desc',
        } = req.query;

        const matchStage = {};
        const buildRegex = (val) => ({ $regex: new RegExp(`^${val}$`, 'i') });

        if (category) matchStage.category = buildRegex(category);
        if (city) matchStage['location.city'] = buildRegex(city);
        if (state) matchStage['location.state'] = buildRegex(state);
        if (country) matchStage['location.country'] = buildRegex(country);
        if (agelimit) matchStage.agelimit = { $lte: parseInt(agelimit) };
        if (status) matchStage.status = buildRegex(status);

        if (search) {
            matchStage.$or = [
                { name: { $regex: search, $options: 'i' } },
                { tagline: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }


        // Define sorting options
        const sortOptions = {
            createdAt_desc: { createdAt: -1 }, // Sort by creation date in descending order (newest first)
            createdAt_asc: { createdAt: 1 },  // Sort by creation date in ascending order (oldest first)
            booking: { 'booking.start': 1 }, // Sort by booking start time in ascending order (earliest first)
        };

        const selectedSort = sortOptions[sort] || { createdAt: -1 };

        const events = await Event.aggregate([
            { $match: matchStage },
            {
                $facet: {
                    data: [
                        { $sort: selectedSort },
                        { $skip: skip },
                        { $limit: limit }
                    ],
                    totalCount: [{ $count: 'count' }]
                }
            }
        ]);

        const totalItems = events[0].totalCount[0]?.count || 0;
        const totalPages = Math.ceil(totalItems / limit);
        const data = events[0].data;

        res.status(200).json({ data, totalItems, totalPages, page, limit });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET EVENT BY ID
export const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.status(200).json(event);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// UPDATE EVENT
export const updateEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.status(200).json({ success: true, message: 'Event updated', data: event });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// DELETE EVENT
export const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// UPLOAD EVENT IMAGE
export const uploadEventImage = async (req, res) => {
    try {
        const file = req.file;
        const eventId = req.params.id;

        if (!file) return res.status(400).json({ message: 'No file uploaded' });

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const imageUrl = await uploadToCloudinary(file.buffer, `event_images/${eventId}_${Date.now()}`);
        event.media.images.push(imageUrl);
        await event.save();

        res.status(200).json({ message: 'Image uploaded', images: event.media.images });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// UPLOAD EVENT BANNER
export const uploadEventBanner = async (req, res) => {
    try {
        const file = req.file;
        const eventId = req.params.id;

        if (!file) return res.status(400).json({ message: 'No file uploaded' });

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const bannerUrl = await uploadToCloudinary(file.buffer, `event_banners/${eventId}`);
        event.media.banner = bannerUrl;
        await event.save();

        res.status(200).json({ message: 'Banner uploaded', banner: bannerUrl });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const addInterest = async (req, res) => {
    try {
        const user = req.user.id;
        const id = req.params.id;

        const interest = await Interest.create({ user, event: id });

        res.status(201).json({
            success: true,
            message: 'Interest added successfully',
            data: interest
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
export const getInterestedPeopleByEventId = async (req, res) => {
    try {
        const id = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const limit = 30;
        const skip = (page - 1) * limit;

        const interestedPeople = await Interest.find({ event: id })
            .populate('user', 'username email profileImg')
            .skip(skip)
            .limit(limit);

        const totalCount = await Interest.countDocuments({ event: id });
        const totalPages = Math.ceil(totalCount / limit);

        res.status(200).json({
            data: interestedPeople,
            totalItems: totalCount,
            totalPages,
            page,
            limit
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Upload multiple business images
export const uploadEventMedia = async (req, res) => {

    try {

        const eventId = req.params.id;
        const { images, banner } = req.files || {};


        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        if (!images && !banner) {
            return res.status(400).json({ message: 'No files uploaded' });
        }
        const uploadedImages = [];
        let bannerUrl;

        if (images && images.length > 0) {
            for (let i = 0; i < images.length; i++) {
                const url = await uploadToCloudinary(images[i].buffer,
                    `event_images/${event._id}_${Date.now()}`);
                uploadedImages.push(url);
            }
        }

        if (banner && banner.length > 0) {
            bannerUrl = await uploadToCloudinary(
                banner[0].buffer,
                `event_banners/${event._id}`);
        }

        event.media = {
            images: uploadedImages,
            banner: bannerUrl
        };
        await event.save();

        res.status(200).json({
            success: true,
            message: 'Business media uploaded successfully',
            media: business.media
        });

    } catch (error) {
        next(error);
    }

}