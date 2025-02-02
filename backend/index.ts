import express, { Express } from 'express';
import path from 'path';
import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';
import api from './api';
import cookieParser from 'cookie-parser';
import { cookies } from 'next/headers';
import cors from 'cors';

const dbUrl: string = process.env.DB_URL || 'default';
const port: number = 8001;

const app: Express = express();

app.use(
    cors({
      origin: 'http://localhost:3000', // Allow requests from this origin
      methods: 'GET,POST,PUT,DELETE', // Allowed methods
      credentials: true, // Allow cookies if needed
    })
  );

app.use(express.json());
app.use(cookieParser());
app.use('/', express.static(path.join(__dirname, '../../public')));

(async (): Promise<void> => {
    console.log("Connecting to the database");
    await mongoose.connect(dbUrl);

    api(app);
    app.listen(port, (): void => {
        console.log(`Listening on port ${port}`);
    });
})();