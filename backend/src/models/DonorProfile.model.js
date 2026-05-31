import mongoose from 'mongoose';
import { computeEligibility } from '../utils/eligibilityHelper.js';
import { sanitizeLocationOnDocument } from '../utils/geoHelper.js';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const donorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: [true, 'Blood group is required'],
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
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isEligible: {
      type: Boolean,
      default: true,
    },
    lastDonated: {
      type: Date,
      default: null,
    },
    donationCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    medicalConditions: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

donorProfileSchema.index({ location: '2dsphere' }, { sparse: true });
donorProfileSchema.index({ bloodGroup: 1, isAvailable: 1, isEligible: 1 });

donorProfileSchema.pre('save', function (next) {
  sanitizeLocationOnDocument(this);
  this.isEligible = computeEligibility(this.lastDonated);
  next();
});

donorProfileSchema.statics.BLOOD_GROUPS = BLOOD_GROUPS;

const DonorProfile = mongoose.model('DonorProfile', donorProfileSchema);

export default DonorProfile;
