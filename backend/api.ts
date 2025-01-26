import express, { Request, Response, RequestHandler} from 'express';
import { PlacePin } from './models';

// Sessions map (from original authentication logic)
const sessions = new Map<string, string>();

// Authentication middleware
const auth = (req: Request, res: Response, next: Function) => {
    const username = 'anonymous';
    // Attach username to the request, defaulting to 'anonymous'
    (req as any).username = username;
    next();
  };
  

function loadPinApi(app: express.Application): void {
  // Create a new pin
  const createPinHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    try {
      const { latitude, longitude, safetyRating, reviewText } = req.body;

      // Validate input
      if (!latitude || !longitude || !safetyRating || !reviewText) {
        res.status(400).send('Missing required pin information');
        return;
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
  };
  
  // Get all pins
  app.get('/api/pins/user', auth, async (req: Request, res: Response) => {
    try {
      const userPins = await PlacePin.find({ userId: (req as any).username });
      res.status(200).json(userPins);
    } catch (error) {
      res.status(500).send('Could not retrieve user pins');
    }
  });

  app.get('/api/pins', auth, async (req: Request, res: Response) => {
    try {
      const userPins = await PlacePin.find();
      res.json(userPins);
      console.log(userPins);
    } catch (error) {
      res.status(500).send('Could not retrieve user pins');
    }
  });

  app.get('/api', async (req: Request, res: Response) => {
    res.send('Hello from the API!');
  });
  
}

export default loadPinApi;