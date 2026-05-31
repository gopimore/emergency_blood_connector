import mongoose from 'mongoose';
import { sanitizeLocationOnDocument } from '../utils/geoHelper.js';

const hospitalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    hospitalName: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
    },
    registrationNo: {
      type: String,
      required: true,
      trim: true,
    },
    contactPhone: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
      },
    },
    address: {
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
    },
  },
  { timestamps: true }
);

hospitalSchema.index({ location: '2dsphere' }, { sparse: true });

hospitalSchema.pre('save', function (next) {
  sanitizeLocationOnDocument(this);
  next();
});

const Hospital = mongoose.model('Hospital', hospitalSchema);

export default Hospital;
