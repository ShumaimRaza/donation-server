import express, { Express, Request, Response, urlencoded } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import passport from 'passport';
import initializePassport from './passportConfig';
import { checkTier } from "./middlewares/middleware"
import AuthRoutes from './routes/authRoutes'
import UserRoutes from './routes/userRoutes'
import DonationRouter from './routes/donationRoutes'
import campaignRouter from './routes/compaignRoutes'
import { configUser } from './config/config';
import { sendMail } from './mailing/Mailing';
import {initIfEmpty} from './init/Initialize'
import ngoRouter from './routes/ngoRoutes';
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require('cors');


// configuring a manager
configUser();

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 4000;



const dbUri = "mongodb+srv://lalakhan98499:WyFbgiQup22kLHee@donor.w8x5gug.mongodb.net/";

if (!dbUri) {
  console.error('No DB URI provided in .env file');
  process.exit(1);
}

mongoose.connect(dbUri)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB', err);
    process.exit(1);
  });

  app.use(cors({
    origin: ['https://www.donosphere.com', 'http://localhost:3000'],
    credentials: true
  }));


app.use(
  session({
    secret: "secretcode",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(cookieParser("secretcode"));
app.use(passport.session());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());

initializePassport(passport);



app.use("/", (req, res, next) => {
  console.log(req.url)
  console.log(req.body)
  console.log("---------------------------------")
  next();
})

// middleware to add tier perks


app.use("/", checkTier)

// Routes
app.use("/auth", AuthRoutes)
app.use("/user", UserRoutes)
app.use("/donation", DonationRouter)
app.use("/campaign", campaignRouter)
app.use("/ngo", ngoRouter)

// testing apis


//Initializa Campaigns
initIfEmpty();

app.listen( 8080, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
