import express, { Request, Response, Router } from 'express';
import multer from 'multer';
import path from 'path';
import User, { IUser } from '../models/User';
import Profile, { IProfile } from '../models/Profile';
import { validateProfileData } from '../middlewares/validation';
import mongoose from 'mongoose';
import { authenticate } from 'passport';
import ValidationLog, {IValidation} from '../models/Validation';
import { sendMail } from '../mailing/Mailing';
const crypto = require('crypto');

const ngoRouter: Router = express.Router();


const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: 'No user currently logged in' });
};
ngoRouter.get('/ngos', async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const ngos = await User.find({ role: 'NGO' }).populate('ngo');
    const ngoDetails = ngos.map((user) => {
      if (!user.ngo) { 
        return null; 
      }
      return {
        ngo: user.ngo,
        userId: user._id,
        fullname: user.fullname, 
        email: user.email,
        role: user.role,
      };
    }).filter(Boolean); 
    return res.status(200).json(ngoDetails);
  } catch (error) {
    console.error("Error fetching NGOs:", error); 
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

ngoRouter.get('/pending', async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const ngos = await User.find({ role: 'NGO', status: 'Pending' }).populate('ngo');
    const ngoDetails = ngos.map((user) => {
      if (!user.ngo) { 
        return null; 
      }
      return {
        ngo: user.ngo,
        userId: user._id,
        fullname: user.fullname, 
        email: user.email,
        role: user.role,
      };
    }).filter(Boolean); 
    return res.status(200).json(ngoDetails);
  } catch (error) {
    console.error("Error fetching NGOs:", error); 
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

ngoRouter.post("/validate", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const ngo = req.body.ngo;
    const validate = req.body.validate;
    const user = await User.findById(ngo);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (validate==true) {
      user.status = 'Approved';
    } else {
      user.status = 'Rejected';
    }
    await user.save();
    return res.status(200).json({ message: 'User updated' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default ngoRouter;