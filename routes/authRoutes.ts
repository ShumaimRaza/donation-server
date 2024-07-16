// Register Route
import express, { Request, Response, Router } from 'express';
import passport from 'passport';
import User, { IUser } from '../models/User';
import bcrypt from 'bcryptjs';
import Ngo from '../models/NGO';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import { getOrCreateContainer } from '../storage/storage';
import { uploader } from '../storage/uploader';

const router: Router = express.Router();

router.post('/register', uploader.single('ngoIcon'), async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
      fullname: req.body.fullname,
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      role: req.body.role,
    });
    const user = await newUser.save();
    if (req.body.role === "NGO") {
      const file:any = req.file;
      if (req.file) {
        // upload image
        const fileUrl = file.url; 
        // end upload image
        const ngo = new Ngo({
          title: req.body.ngoTitle,
          icon: fileUrl
        });
        const savedNgo = await ngo.save();

        user.ngo = savedNgo._id;
        await user.save();
      } else {
        throw new Error("NGO role requires an icon.");
      }
    }

    res.status(200).json({ message: 'User registered successfully' });
  } catch (err: any) {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      await User.findByIdAndDelete(user._id); // Assuming you have a User model
    }
    console.log("error registering user:", err.message);
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
});
// Login Route
router.post('/login', (req: Request, res: Response, next: Function) => {
  passport.authenticate('local', (err: any, user: IUser, info: any) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed', err, info });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.json({ message: 'Logged in successfully', user: user });
    });
  })(req, res, next);
});

// Logout Route
router.get('/logout', (req: Request, res: Response) => {
  req.logout((err: any) => {
    if (!err) {
      res.json({ message: 'Logged out successfully' });
    } else {
      res.json({
        message: 'error',
        err
      });
    }
  });
});

// User Route
router.get('/user', (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ message: 'No user currently logged in' });
  }
});


export default router;