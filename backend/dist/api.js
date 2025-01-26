"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("./models");
// Sessions map (from original authentication logic)
const sessions = new Map();
// Authentication middleware
const auth = (req, res, next) => {
    const username = 'anonymous';
    // Attach username to the request, defaulting to 'anonymous'
    req.username = username;
    next();
};
function loadPinApi(app) {
    // Create a new pin
    const createPinHandler = (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { latitude, longitude, safetyRating, reviewText } = req.body;
            // Validate input
            if (!latitude || !longitude || !safetyRating || !reviewText) {
                res.status(400).send('Missing required pin information');
                return;
            }
            // Create new pin
            const newPin = new models_1.PlacePin({
                latitude,
                longitude,
                safetyRating,
                reviewText,
            });
            yield newPin.save();
            res.status(201).json(newPin);
        }
        catch (error) {
            res.status(500).send('Could not create pin');
        }
    });
    // Get all pins
    app.get('/api/pins/user', auth, (req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            const userPins = yield models_1.PlacePin.find({ userId: req.username });
            res.status(200).json(userPins);
        }
        catch (error) {
            res.status(500).send('Could not retrieve user pins');
        }
    }));
    app.get('/api', (req, res) => __awaiter(this, void 0, void 0, function* () {
        res.send('Hello from the API!');
    }));
}
exports.default = loadPinApi;
