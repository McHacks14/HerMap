import express, { Express } from 'express';
import path from 'path';
import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';
import api from './api';
import cookieParser from 'cookie-parser';
import { cookies } from 'next/headers';

const dbUrl: string = process.env.DB_URL ?? "mongodb://localhost:27017/hermap";
const port: number = 8001;
const app: Express = express();

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