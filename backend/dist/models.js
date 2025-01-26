"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlacePin = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const PlacePinSchema = new mongoose_1.default.Schema({
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    safetyRating: { type: Number, required: true, min: 1, max: 5 },
    reviewText: { type: String, required: true },
});
exports.PlacePin = mongoose_1.default.model('PlacePin', PlacePinSchema, 'pins');
