import express, { Request, Response } from 'express';
import { PlacePin } from './models';

// Sessions map (from original authentication logic)
const sessions = new Map<string, string>();

// Authentication middleware
const auth = (req: Request, res: Response, next: Function) => {
    const sessionId = req.cookies?.sessionId;
    const username = sessionId ? sessions.get(sessionId) : 'anonymous';
  
    // Attach username to the request, defaulting to 'anonymous'
    (req as any).username = username;
    next();
  };
  

function loadPinApi(app: express.Application) {
  // Create a new pin
  app.post('/api/pins', auth, async (req: Request, res: Response) => {
    try {
      const { latitude, longitude, safetyRating, reviewText } = req.body;
  
      // Validate input
      if (!latitude || !longitude || !safetyRating || !reviewText) {
        return res.status(400).send('Missing required pin information');
      }
  
      // Create new pin
      const newPin = new PlacePin({
        userId: (req as any).username, // Will be 'anonymous' if no session
        latitude,
        longitude,
        safetyRating,
        reviewText,
      });
  
      await newPin.save();
  
      res.status(201).json(newPin);
    } catch (error) {
      res.status(500).send('Could not create pin');
    }
  });
  
  // Get all pins
  app.get('/api/pins/user', auth, async (req: Request, res: Response) => {
    try {
      const userPins = await PlacePin.find({ userId: (req as any).username });
      res.status(200).json(userPins);
    } catch (error) {
      res.status(500).send('Could not retrieve user pins');
    }
  });
  
}

export default loadPinApi;