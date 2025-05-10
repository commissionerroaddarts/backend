import mongoose from 'mongoose';
import Business from '../models/Business.js';
import { uploadToCloudinary } from './../services/cloudinary.js';
import _ from 'lodash';
import Review from '../models/Review.js';

export const createBusiness = async (req, res) => {
  try {
    const businessData = {
      ...req.body,
      userId: req.user.id,
    };

    const { images, logo } = req.body.media || {};
    _.unset(businessData, 'media');

    const business = await Business.create(businessData);

    const uploadedImages = [];
    let logoUrl;

    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const imageUrl = await uploadToCloudinary(
          images[i],
          `business_images/${business._id}_${Date.now()}`
        );
        uploadedImages.push(imageUrl);
      }
    }

    if (logo ) {
      logoUrl = await uploadToCloudinary(
        logo,
        `business_logos/${business._id}`
      );
    }

    business.media = {
      images: uploadedImages,
      logo: logoUrl,
      video: req.body.video || undefined,
    };

    await business.save();
    res.status(201).json(business);
  } catch (err) {
    console.error('Error creating business:', err);
    res.status(500).json({ message: 'Failed to create business', error: err });
  }
};

export const bulkCreateBusinesses = async (req, res) => {
  try {
    const businesses = req.body; // Expecting an array of business objects
    const result = await Business.insertMany(businesses);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all businesses
export const getAllBusinesses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const {
      category,
      priceCategory,
      city,
      state,
      country,
      bordtype,
      agelimit,
      search,
      sort = 'createdAt_desc',
    } = req.query;
    const ratingFilter = req.query.rating ? parseFloat(req.query.rating) : null;
    const rating = isNaN(ratingFilter) ? null : ratingFilter;
    const matchStage = {};


    const buildRegex = (value) => ({ $regex: new RegExp(`^${value}$`, 'i') });

    if (category) matchStage.category = buildRegex(category);
    if (priceCategory) matchStage['price.category'] = priceCategory;
    if (city) matchStage['location.city'] = buildRegex(city);
    if (state) matchStage['location.state'] = buildRegex(state);
    if (country) matchStage['location.country'] = buildRegex(country);
    if (bordtype) matchStage.bordtype = buildRegex(bordtype);
    if (agelimit) matchStage.agelimit = { $lte: parseInt(agelimit) };

    if (search) {
      matchStage.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tagline: { $regex: search, $options: 'i' } },
        { shortDis: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOptions = {
      createdAt_desc: { createdAt: -1 },
      createdAt_asc: { createdAt: 1 },
      rating_desc: { averageRating: -1 },
      rating_asc: { averageRating: 1 },
    };
    const selectedSort = sortOptions[sort] || { createdAt: -1 };


    const businesses = await Business.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'business',
          as: 'reviews',
        }
      },
      {
        $addFields: {
          totalRatings: { $size: '$reviews' },
          averageRating: {
            $cond: [
              { $gt: [{ $size: '$reviews' }, 0] },
              { $avg: '$reviews.ratings.overallRating' },
              0
            ]
          }
        }
      },
      {
        $project: {
          reviews: 0, // remove review docs
        }
      },
      // Apply rating filter AFTER calculating averageRating
      ...(rating ? [{ $match: { averageRating: { $gte: parseFloat(rating) } } }] : []),
      {
        $facet: {
          // metadata: [{ $count: 'total' }],
          data: [
            { $sort: selectedSort },
            { $skip: skip },
            { $limit: limit }
          ],

          totalCount: [
            { $count: 'count' },
          ],
        }
      }
    ]);



    const totalItems = businesses[0].totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalItems / limit);
    const data = businesses[0].data;

    res.status(200).json({
      data,
      totalItems,
      totalPages,
      page,
      limit,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get business by ID
export const getBusinessById = async (req, res) => {
  try {
    const businessData = await Business.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } }, // Match the business
      {
        $lookup: {
          from: 'reviews', // collection name in db (MUST BE plural and lowercase usually)
          localField: '_id',
          foreignField: 'business',
          as: 'reviews'
        }
      },
      {
        $addFields: {
          averageRating: { $ifNull: [{ $avg: "$reviews.ratings.overallRating" }, 0] },
          totalRatings: { $size: "$reviews" }
        }
      },
      {
        $project: {
          reviews: 0 // don't send reviews array unless you want
        }
      }
    ]);

    if (!businessData.length) {
      return res.status(404).json({ message: 'Business not found' });
    }

    res.status(200).json(businessData[0]); // Send the first (and only) business object
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

// Update business by ID
export const updateBusiness = async (req, res) => {
  try {
    const business = await Business.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!business) return res.status(404).json({ message: 'Business not found' });
    res.status(200).json({
      success: true,
      message: 'Business updated successfully',
      data: business
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete business by ID
export const deleteBusiness = async (req, res) => {
  try {
    const business = await Business.findByIdAndDelete(req.params.id);
    if (!business) return res.status(404).json({ message: 'Business not found' });
    await Review.deleteMany({ business: business._id });
    res.status(200).json({ message: 'Business deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Upload business logo
export const uploadBusinessLogo = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const businessId = req.params.id;

    const business = await Business.findById(businessId);

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // if (req.user.id !== business.userid.toString()) {
    //   return res.status(403).json({ message: 'Unauthorized to update this business' });
    // }

    const public_id = `business_logo/logo_${businessId}`;
    const imageUrl = await uploadToCloudinary(file.buffer, public_id);

    console.log('Logo URL:', imageUrl);

    const updatedBusiness = await Business.findByIdAndUpdate(
      businessId,
      { 'media.logo': imageUrl },
      { new: true }
    );

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    res.status(200).json({ message: 'Logo uploaded successfully', logo: updatedBusiness.media.logo });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Upload a single business image
export const uploadBusinessImage = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const businessId = req.params.id;

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // if (req.user.id !== business.userid.toString()) {
    //   return res.status(403).json({ message: 'Unauthorized' });
    // }

    const timestamp = Date.now();
    const public_id = `business_images/image_${businessId}_${timestamp}`;
    const imageUrl = await uploadToCloudinary(file.buffer, public_id);

    business.media.images.push(imageUrl);
    await business.save();

    res.status(200).json({
      message: 'Business image uploaded successfully',
      images: business.media.images
    });
  } catch (error) {
    console.error('Upload business image error:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Upload multiple business images
export const uploadBusinessMedia = async (req, res) => {

  try {

    const businessId = req.params.id;
    const { images, businessLogo } = req.files || {};

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    if (!images && !businessLogo) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedImages = [];
    let logoUrl;

    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const imageUrl = await uploadToCloudinary(
          images[i].buffer,
          `business_images/${businessId}_${Date.now()}`
        );
        uploadedImages.push(imageUrl);
      }
    }

    if (businessLogo && businessLogo.length > 0) {
      logoUrl = await uploadToCloudinary(
        businessLogo[0].buffer,
        `business_logos/${businessId}`
      );
    }

    business.media = {
      images: uploadedImages,
      logo: logoUrl,
      // video: req.body.video || undefined,
    };

    await business.save();

    res.status(200).json({
      success: true,
      message: 'Business media uploaded successfully',
      media: business.media
    });

  } catch (error) {
    next(error);
  }
}

