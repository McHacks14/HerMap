import express, { Request, Response, RequestHandler} from 'express';
import { PlacePin } from './models';

function loadPinApi(app: express.Application): void {

  // Create new pins
  app.post("/api/send-pin", async (req: Request, res: Response) => {
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
  
  // Fetch all pins
  app.get('/api/pins', async (req: Request, res: Response) => {
    try {
      const userPins = await PlacePin.find();
      res.json(userPins);
      console.log(userPins);
    } catch (error) {
      res.send('Could not retrieve user pins');
    }
  });

    /* Tester methods
  app.post('/api/create', (req, res) => {
    res.send('Hello from the API!');
    });

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
  */
}

export default loadPinApi;