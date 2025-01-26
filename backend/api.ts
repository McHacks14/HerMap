import express, { Request, Response, RequestHandler} from 'express';
import { PlacePin } from './models';

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
        latitude,
        longitude,
        safetyRating,
        reviewText,
      });
  
      await newPin.save();
  
      res.status(201).json(newPin);
      console.log("Success");
    } catch (error) {
      res.status(404).send('Could not create pin');
    }
  };

  app.post("/send", (req: Request, res: Response) => {
    try {
      const dataToSend = req.body; // Get data from the client
  
      // Make an API POST request using Axios
      console.log("Success"); // Print success and response data
      res.status(200).send("Data sent successfully");
    } catch (error) {
      res.send(error); // Print error
      res.status(500).send("Failed to send data");
    }
  });

  app.post('/send2', createPinHandler);

  app.post("/send1", async (req: Request, res: Response) => {
    try {
      const { latitude, longitude, safetyRating, reviewText } = req.body;
  
      // Validate input
      if (!latitude || !longitude || !safetyRating || !reviewText ) {
        res.status(400).send('Missing required pin information');
        return;
      }
  
      // Create new pin
      const newPin = new PlacePin({
        latitude,
        longitude,
        safetyRating,
        reviewText
      });
  
      // Save to database
      await newPin.save();
  
      // Respond with the created pin
      res.status(201).json(newPin);
      console.log('Success: New pin created');
    } catch (error) {
      res.send(error);
      res.status(500).send('Could not create pin');
    }
  });

  app.post('/api/create', (req, res) => {
    res.send('Hello from the API!');
    });
  
  // Get all pins
  app.get('/api/pins/user', async (req: Request, res: Response) => {
    try {
      const userPins = await PlacePin.find({ userId: (req as any).username });
      res.status(200).json(userPins);
    } catch (error) {
      res.status(500).send('Could not retrieve user pins');
    }
  });

  app.get('/api/pins', async (req: Request, res: Response) => {
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