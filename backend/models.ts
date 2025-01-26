import mongoose from 'mongoose';

export interface PlacePinInterface {
  latitude: number;
  longitude: number;
  safetyRating: number;
  reviewText: string;
  userId: string;
  createdAt?: Date;
}

const PlacePinSchema = new mongoose.Schema<PlacePinInterface>({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  safetyRating: { type: Number, required: true, min: 1, max: 5 },
  reviewText: { type: String, required: true },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const PlacePin = mongoose.model<PlacePinInterface>('PlacePin', PlacePinSchema);