import express, { Request, Response, Router } from 'express';
import { IUser } from '../models/User';
import Donation, { IDonation } from '../models/Donation';
import Campaign, { ICampaign } from '../models/Campaign'; // Import the Campaign model
import { validateProfileData } from '../middlewares/validation';
import mongoose from 'mongoose';
import { authenticate } from 'passport';
import ValidationLog, { IValidation } from '../models/Validation';
import { sendMail } from '../mailing/Mailing';
import { IProfile } from '../models/Profile';

const donationRouter: Router = express.Router();

const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: 'No user currently logged in' });
};

// Create a new donation
donationRouter.post('/', isAuthenticated, async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const profile = user.profile as IProfile;

  try {
    const { donor, paymentMethod, amount, campaign } = req.body;
    const newDonation = new Donation({ donor, paymentMethod, amount, campaign });
    const savedDonation = await newDonation.save();

    const originalCampaign = await Campaign.findById(campaign);

    if(!originalCampaign){
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if(originalCampaign.type === 'Zakat'){
        profile.donation.Zakat += amount;
    }else if(originalCampaign.type === 'Fitrana'){
        profile.donation.Fitrana += amount;
    }else if(originalCampaign.type === 'Sadqa'){
      profile.donation.Sadqa += amount;
    }else if(originalCampaign.type === 'Fidya'){
      profile.donation.Fidya += amount;
    }else if(originalCampaign.type === 'Flood_Relief'){
      profile.donation.Flood_Relief += amount;
    }else if(originalCampaign.type === 'Ramazan_Package'){
      profile.donation.Ramazan_Package += amount;
    }else if(originalCampaign.type === 'Kaffara'){
      profile.donation.Kaffara += amount;
    }else if(originalCampaign.type === 'Earthquake'){
      profile.donation.Earthquake += amount;
    }else if(originalCampaign.type === 'Khairat'){
      profile.donation.Khairat += amount;
    }
    await profile.save();

    // Update the Campaign's donations field with the new donation
    await Campaign.findByIdAndUpdate(campaign, { $push: { donations: savedDonation._id }, $inc: { amountRaised: amount } });

    // Fetch the updated campaign to calculate the new total
    const updatedCampaign = await Campaign.findById(campaign);
    const totalDonations = updatedCampaign?.donations.reduce((total, donation) => total + donation.amount, 0) || 0;

    // Update the campaign's total with the calculated totalDonations
    //await Campaign.findByIdAndUpdate(campaign, { total: totalDonations });

    res.status(201).json({ donation: savedDonation, updatedCampaign });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error occurred while creating a donation' });
  }
})

// Get a list of all donations
donationRouter.get('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const donations = await Donation.find().populate('donor campaign');
    res.status(200).json(donations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error occurred while fetching donations' });
  }
});

// Get a specific donation by ID
donationRouter.get('/:id', isAuthenticated, async (req: Request, res: Response) => {
  const donationId = req.params.id;
  try {
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    res.status(200).json(donation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error occurred while fetching the donation' });
  }
});

// Update a specific donation by ID
donationRouter.put('/:id', isAuthenticated, async (req: Request, res: Response) => {
  const donationId = req.params.id;
  const { donor, paymentMethod, amount, campaign } = req.body;
  try {
    const updatedDonation = await Donation.findByIdAndUpdate(
      donationId,
      { donor, paymentMethod, amount, campaign },
      { new: true }
    );
    if (!updatedDonation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    res.status(200).json(updatedDonation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error occurred while updating the donation' });
  }
});

// Delete a donation by ID
// Delete a donation by ID
donationRouter.delete('/:id', isAuthenticated, async (req: Request, res: Response) => {
  const donationId = req.params.id;
  try {
    const donation = await Donation.findOne({ _id: donationId });
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    const campaignId = donation.campaign;
    await donation.deleteOne();

    await Campaign.findByIdAndUpdate(campaignId, { $pull: { donations: donationId } });

    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error occurred while deleting the donation' });
  }
});


export default donationRouter;
