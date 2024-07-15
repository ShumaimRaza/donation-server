import express, { Request, Response, Router } from 'express';
import multer from 'multer';
import path from 'path';
import { IUser } from '../models/User';
import Profile, { IProfile } from '../models/Profile';
import { validateProfileData } from '../middlewares/validation';
import mongoose from 'mongoose';
import { authenticate } from 'passport';
import ValidationLog, {IValidation} from '../models/Validation';
import { sendMail } from '../mailing/Mailing';
const crypto = require('crypto');

const profileRouter: Router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(__dirname, '../uploads/photos');
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: 'No user currently logged in' });
};

profileRouter.get('/profile', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const profile = await Profile.findById(user.profile?._id);
    if (profile) {
      return res.status(200).json(profile);
    }
    return res.status(404).json({ message: 'Profile not found' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

profileRouter.put('/profile', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const profileData = req.body;
    const validationErrors = validateProfileData(profileData);

    if (validationErrors) {
      console.log(validationErrors);
      return res.status(400).json({ errors: validationErrors });
    }

    let profile = await Profile.findById(user.profile?._id);
    if (!profile) {
      profile = new Profile(profileData);
      await profile.save();
      user.profile = profile._id;
      await user.save();
    } else {
      Object.assign(profile, profileData);
      await profile.save();
    }

    return res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Internal Server Error', error });
  }
});

profileRouter.post('/profile/picture', isAuthenticated, upload.single('profilePicture'), async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;

    if (user.profile) {
      if (req.file) {
        user.profile.profilePicture = `/user/download/${req.file.filename}`;
        await user.profile.save();
        return res.status(200).json({ message: 'Profile picture set successfully' });
      } else {
        return res.status(400).json({ message: 'No file uploaded' });
      }
    } else {
      if (req.file) {
        user.profile = new Profile({
          profilePicture: `/user/download/${req.file.filename}`
        });
        await user.profile.save();
        await user.save();
        return res.status(200).json({ message: 'Profile picture set successfully' });
      } else {
        return res.status(400).json({ message: 'No file uploaded' });
      }
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});


profileRouter.get('/download/:filename', (req: Request, res: Response) => {
  try {
    const filename = req.params.filename;
    const directoryPath = path.join(__dirname, '../uploads/photos');
    const filePath = path.join(directoryPath, filename);

    res.download(filePath, filename, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error occurred while downloading the file');
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

profileRouter.post("/location", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const coordinates = req.body.coordinates;
    const profile = await Profile.findById(user.profile?._id);
    if(!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    profile.location = {
      type: "Point",
      coordinates
    };
    await profile.save();
    return res.status(200).json({ message: 'Location updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


profileRouter.post("/resendEmailValidation", isAuthenticated, async (req, res) => {
  const user = req.user as IUser;
  const email = user.email;

  try {
    // Generate a random 6-digit token
    const token = generateRandomNumericToken();

    let validation = await ValidationLog.findOne({ user: user._id });
    if (validation) {
      validation.token = token.toString();
    } else {
      validation = new ValidationLog({ token, user: user._id });
    }

    // Create a more informative email message
    const subject = "Email Verification Token";
    const message = `
      Hello ${user.fullname},

      Your verification token for email validation is: ${token}

      Please use this token to complete the email verification process.

      If you did not request this token, please ignore this email.

      Thank you,
      YourAppName Team
    `;

    // Send the email
    sendMail(email, subject, message)
      .then(async (r) => {
        await validation?.save();
        res.send({ message: "Email sent" });
      })
      .catch(err => {
        console.error(err);
        res.status(500).send({ message: "Error occurred while sending email" });
      });

  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error occurred while processing your request." });
  }
});


function generateRandomNumericToken() {
  const min = 100000;
  const max = 999999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

profileRouter.post("/validate", isAuthenticated, async (req, res) => {
  const user = req.user as IUser;
  const token = req.body.token;
  const validation = await ValidationLog.findOne({ user: user._id });

  if (validation && validation.token === token) {
      user.emailVerified = true;
      await user.save();
      res.send({ message: "Email verified" });
  } else {
      res.status(400).send({ message: "Invalid or expired token" });
  }
});

export default profileRouter;