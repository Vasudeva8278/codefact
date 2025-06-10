import mongoose from 'mongoose';

const StudioSchema = new mongoose.Schema({
  studioName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
 
  address: {
    type: String,
    required: true,
  },
  location: {
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  perHourCharge: {
    type: Number,
    required: true,
  },
  maxDistance: {
    type: Number,
    default: 50,
    required: false,
  },
  services: {
    type: [String],
    default: []
  },
  equipment: [{
    name: { type: String, required: true },
    brand: { type: String },
    model: { type: String }
  }],
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

// Add text index for search
StudioSchema.index({
  studioName: 'text',
  description: 'text',
  'location.city': 'text',
});

// Delete the existing model if it exists to prevent the userId field from persisting
if (mongoose.models.Studio) {
  delete mongoose.models.Studio;
}

export default mongoose.model('Studio', StudioSchema);