/**
 * Build a valid GeoJSON Point or return undefined (omit from document).
 * MongoDB 2dsphere rejects { type: 'Point' } without coordinates.
 */
export const toGeoPoint = (coordinates) => {
  if (!Array.isArray(coordinates) || coordinates.length !== 2) {
    return undefined;
  }
  const lng = Number(coordinates[0]);
  const lat = Number(coordinates[1]);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    return undefined;
  }
  if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
    return undefined;
  }
  return { type: 'Point', coordinates: [lng, lat] };
};

export const sanitizeLocationOnDocument = (doc) => {
  const point = toGeoPoint(doc.location?.coordinates);
  if (point) {
    doc.location = point;
  } else if (doc.location) {
    doc.set('location', undefined);
    doc.markModified('location');
  }
};

export const cleanupInvalidGeoLocations = async (model, label) => {
  const result = await model.updateMany(
    {
      location: { $exists: true },
      $or: [
        { 'location.coordinates': { $exists: false } },
        { 'location.coordinates': { $size: 0 } },
        { 'location.coordinates.0': { $exists: false } },
        { 'location.coordinates.1': { $exists: false } },
      ],
    },
    { $unset: { location: '' } }
  );
  if (result.modifiedCount > 0) {
    return { label, modifiedCount: result.modifiedCount };
  }
  return null;
};
