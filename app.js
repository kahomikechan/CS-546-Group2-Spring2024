import express from 'express';
import session from 'express-session';
import path from 'path';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

import indexRouter from './routes/index.js';
import authRouter from './routes/auth_routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

//middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

//root middleware
app.use((req, res, next) => {
    console.log(`${new Date().toUTCString()}: ${req.method} ${req.originalUrl} (Non-Authenticated User)`);
    next();
});

//route middleware
app.use('/', indexRouter);
app.use('/', authRouter);

//error middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
