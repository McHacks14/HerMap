const express = require('express');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const api = require('./api');
const cookies = require('./cookies');
// We do not need CORS since your application will run on the same domain
// const cors = require('cors')
// app.use(cors())

const dbUrl = process.env.DB_URL ?? "mongodb://localhost:27017/app";
const port = 8000;
const app = express();

app.use(express.json());
app.use(cookies.parser);
app.use('/', express.static(path.join(__dirname, '../../public')));


(async () => {
    console.log("Connecting to the database");
    await mongoose.connect(dbUrl);

    api.loadApi(app);
    app.listen(port, () => {
        console.log(`Listening on port ${port}`);
    });
})();