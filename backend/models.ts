import mongoose from 'mongoose';

export interface PlacePinInterface {
  latitude: number;
  longitude: number;
  safetyRating: number;
  reviewText: string;
}

const PlacePinSchema = new mongoose.Schema<PlacePinInterface>({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  safetyRating: { type: Number, required: true, min: 1, max: 5 },
  reviewText: { type: String, required: true },
});

export const PlacePin = mongoose.model<PlacePinInterface>('PlacePin', PlacePinSchema, 'pins');