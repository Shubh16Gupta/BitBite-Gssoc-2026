/**
 * Field service.
 *
 * Encapsulates all data access for Field documents. Every function is scoped to
 * a single farmer id so a farmer can only ever touch their own fields — the
 * controller passes `req.farmer._id` and never a client-supplied owner.
 *
 * Lookups that target a specific field return `null` when the field either does
 * not exist OR belongs to another farmer; the controller maps that to a 404 so
 * we never leak the existence of another farmer's records.
 */
const Field = require('../models/Field');

/**
 * Create a new field owned by the given farmer.
 * @param {string} farmerId
 * @param {object} data - { fieldName, cropType, area, areaUnit?, location }
 * @returns {Promise<Field>}
 */
const createField = (farmerId, data) =>
  Field.create({
    farmer: farmerId,
    fieldName: data.fieldName,
    cropType: data.cropType,
    area: data.area,
    areaUnit: data.areaUnit,
    location: {
      latitude: data.location.latitude,
      longitude: data.location.longitude,
    },
  });

/**
 * List every field belonging to a farmer, newest first.
 * @param {string} farmerId
 * @returns {Promise<Field[]>}
 */
const listFields = (farmerId) => Field.find({ farmer: farmerId }).sort({ createdAt: -1 });

/**
 * Fetch a single field by id, scoped to the owning farmer.
 * @returns {Promise<Field|null>}
 */
const getFieldById = (farmerId, fieldId) => Field.findOne({ _id: fieldId, farmer: farmerId });

/**
 * Update a field the farmer owns. Only whitelisted keys are applied.
 * @returns {Promise<Field|null>} updated document, or null if not found/owned.
 */
const updateField = (farmerId, fieldId, data) => {
  const update = {};
  if (data.fieldName !== undefined) update.fieldName = data.fieldName;
  if (data.cropType !== undefined) update.cropType = data.cropType;
  if (data.area !== undefined) update.area = data.area;
  if (data.areaUnit !== undefined) update.areaUnit = data.areaUnit;
  if (data.location !== undefined) {
    if (data.location.latitude !== undefined) update['location.latitude'] = data.location.latitude;
    if (data.location.longitude !== undefined) {
      update['location.longitude'] = data.location.longitude;
    }
  }

  return Field.findOneAndUpdate({ _id: fieldId, farmer: farmerId }, update, {
    new: true, // return the updated document
    runValidators: true, // enforce schema constraints on update
  });
};

/**
 * Delete a field the farmer owns.
 * @returns {Promise<Field|null>} deleted document, or null if not found/owned.
 */
const deleteField = (farmerId, fieldId) =>
  Field.findOneAndDelete({ _id: fieldId, farmer: farmerId });

module.exports = {
  createField,
  listFields,
  getFieldById,
  updateField,
  deleteField,
};
