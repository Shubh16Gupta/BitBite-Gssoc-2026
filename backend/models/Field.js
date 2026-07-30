const mongoose = require('mongoose');

/**
 * Field model.
 *
 * Represents a single cultivable plot owned by a farmer. A farmer can own many
 * fields, so we keep a Mongoose reference back to the owning Farmer document.
 * Ownership is enforced at the query layer (see services/fieldService.js) — every
 * read/write is scoped to `farmer: <authenticated farmer id>`.
 */
const fieldSchema = new mongoose.Schema(
  {
    // Owning farmer. Indexed because every query filters by it.
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: true,
      index: true,
    },

    fieldName: {
      type: String,
      required: [true, 'Field name is required'],
      trim: true,
    },
    cropType: {
      type: String,
      required: [true, 'Crop type is required'],
      trim: true,
    },

    // Cultivable area of this specific field.
    area: {
      type: Number,
      required: [true, 'Area is required'],
      min: [0, 'Area cannot be negative'],
    },
    areaUnit: {
      type: String,
      enum: ['acre', 'hectare'],
      default: 'acre',
    },

    // Geographic location of the field centroid.
    location: {
      latitude: {
        type: Number,
        required: [true, 'Latitude is required'],
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90'],
      },
      longitude: {
        type: Number,
        required: [true, 'Longitude is required'],
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180'],
      },
    },
  },
  {
    // Adds createdAt & updatedAt automatically.
    timestamps: true,
  }
);

module.exports = mongoose.model('Field', fieldSchema);
