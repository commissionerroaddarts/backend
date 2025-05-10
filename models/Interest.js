import mongoose from 'mongoose';

const { Schema } = mongoose;

const InterestSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    event: {
        type: Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    }
});

export default mongoose.model('Interest', InterestSchema);