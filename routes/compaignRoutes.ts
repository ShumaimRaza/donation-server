import express, { Request, Response, Router } from 'express';
import Campaign, { ICampaign } from '../models/Campaign';
import Donation, { IDonation } from '../models/Donation';
import { validateProfileData } from '../middlewares/validation';
import { isAuthenticated } from '../middlewares/middleware';
import { IUser } from '../models/User';
import { IProfile } from '../models/Profile';
import { INGO } from '../models/NGO';
import axios from 'axios';
import multer from 'multer';
import path from 'path';
import { UpdateQuery, FilterQuery } from 'mongoose';
import { getOrCreateContainer } from '../storage/storage';

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

const campaignRouter: Router = express.Router();


async function addRandomClicksToCampaigns() {
  const campaigns = await Campaign.find();

  const today = new Date();
  const tenDaysAgo = new Date(today);
  tenDaysAgo.setDate(today.getDate() - 10);

  for (const campaign of campaigns) {
    for (let i = 0; i < 10; i++) {
      const date = new Date(tenDaysAgo);
      date.setDate(date.getDate() + i);
      date.setHours(0, 0, 0, 0); // Normalize to start of day

      const randomClicks = Math.floor(Math.random() * 10) + 1; // 1-10 clicks

      // Find existing click entry or create new
      const todaysClickIndex = campaign.clicks.findIndex(
        (click) => click.date.getTime() === date.getTime()
      );

      const updateOperation: UpdateQuery<ICampaign> = todaysClickIndex !== -1
        ? {
          $inc: { [`clicks.${todaysClickIndex}.count`]: randomClicks },
        }
        : {
          $push: { clicks: { date, count: randomClicks } },
        };

      await campaign.updateOne(updateOperation);
    }
  }
}

// addRandomClicksToCampaigns();

async function incrementClickCount(campaignId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find the campaign to check if it has today's click data
  const campaign = await Campaign.findById(campaignId);

  if (campaign) {
    const todaysClickIndex = campaign.clicks.findIndex(
      (click) => click.date.getTime() === today.getTime()
    );

    // Update or add today's click data based on whether it exists
    const updateOperation: UpdateQuery<ICampaign> = todaysClickIndex !== -1
      ? {
        $inc: { [`clicks.${todaysClickIndex}.count`]: 1 }, // Update existing count
      }
      : {
        $push: { clicks: { date: today, count: 1 } }, // Add new click data
      };

    await Campaign.findByIdAndUpdate(campaignId, updateOperation, { new: true });
  }
}

campaignRouter.post('/', upload.single('image'), async (req: any, res: any) => {
  try {
    const { title, description, total, type } = req.body;
    // upload image
    const filename = `${Date.now()}-${req.file.originalname}`;
    const blobClient = (await getOrCreateContainer("uploads")).getBlockBlobClient(filename);
    const data = req.file.buffer;
    await blobClient.upload(data, data.length);
    const fileUrl = `${blobClient.url}`;
    // end upload image
    const ngo = req.user.ngo as INGO;
    const newCampaign = new Campaign({
      title,
      description,
      image: fileUrl,
      progress: 0,
      amountRaised: 0,
      total,
      ngo, 
      type
    });
    const savedCampaign = await newCampaign.save();
    res.status(201).json(savedCampaign);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error occurred while creating a campaign' });
  }
});

// Get a list of all campaigns
campaignRouter.get('/', async (req: Request, res: Response) => {
  try {
    const campaigns = await Campaign.find().populate('donations').populate('ngo');
    for (const campaign of campaigns) {
      await incrementClickCount(campaign._id);
    }
    res.status(200).json(campaigns);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error occurred while fetching campaigns' });
  }
});

// Get a list of my campaigns
campaignRouter.get('/my', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const campaigns = await Campaign.find({ ngo: user.ngo }).populate('donations').populate('ngo');
    for (const campaign of campaigns) {
      await incrementClickCount(campaign._id);
    }
    res.status(200).json(campaigns);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error occurred while fetching campaigns' });
  }
});

campaignRouter.get('/campaign/:id', async (req: Request, res: Response) => {
  try {
    const campaignId = req.params.id;
    await incrementClickCount(campaignId);
    const campaign = await Campaign.findById(campaignId).populate('donations').populate('ngo');
    res.status(200).json(campaign);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error occurred while fetching campaigns' });
  }
});


campaignRouter.get('/recommended', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const campaigns = await Campaign.find().populate('donations ngo');
    const user = req.user as IUser;
    const profile = user.profile as IProfile;
    const recommendedCampaigns = [];

    // Loop through each campaign
    for (const campaign of campaigns) {
      const ngo = campaign.ngo as INGO;
      const data = {
        "Zakat": profile.donation.Zakat,
        "Fitrana": profile.donation.Fitrana,
        "Sadqa": profile.donation.Sadqa,
        "Fidya": profile.donation.Fidya,
        "Flood_Relief": profile.donation.Flood_Relief,
        "Ramazan_Package": profile.donation.Ramazan_Package,
        "Kaffara": profile.donation.Kaffara,
        "Earthquake": profile.donation.Earthquake,
        "Khairat": profile.donation.Khairat,
        "Orphan_Care": profile.donation.Orphan_Care,
        "Khummas": profile.donation.Khummas,
        "Education": profile.donation.Education,
        "Marriage": profile.donation.Marriage,
        "Old_Age_Home": profile.donation.Old_Age_Home,
        "Aqiqah": profile.donation.Aqiqah,
        "Zakat_Rating": ngo.Zakat_Rating,
        "Fitrana_Rating": ngo.Fitrana_Rating,
        "Sadqa_Rating": ngo.Sadqa_Rating,
        "Fidya_Rating": ngo.Fidya_Rating,
        "Flood_Relief_Rating": ngo.Flood_Relief_Rating,
        "Ramazan_Package_Rating": ngo.Ramazan_Package_Rating,
        "Kaffara_Rating": ngo.Kaffara_Rating,
        "Earthquake_Rating": ngo.Earthquake_Rating,
        "Khairat_Rating": ngo.Khairat_Rating,
        "Orphan_Care_Rating": ngo.Orphan_Care_Rating,
        "Khummas_Rating": ngo.Khummas_Rating,
        "Education_Rating": ngo.Education_Rating,
        "Marriage_Rating": ngo.Marriage_Rating,
        "Old_Age_Home_Rating": ngo.Old_Age_Home_Rating,
        "Aqiqah_Rating": ngo.Aqiqah_Rating
      };

      // Make API call to get evaluation result
      const result = await axios.post('http://127.0.0.1:5000/predict', data);


      // Add the campaign with evaluation==1 to the list of recommended campaigns
      if (result.data.prediction === 1)
        recommendedCampaigns.push(campaign);
    }

    res.status(200).json(recommendedCampaigns);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error occurred while fetching campaigns' });
  }
});



// Get a specific campaign by ID
campaignRouter.get('/:id', async (req: Request, res: Response) => {
  const campaignId = req.params.id;
  try {
    await incrementClickCount(campaignId);
    const campaign = await Campaign.findById(campaignId).populate('donations');
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    res.status(200).json(campaign);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error occurred while fetching the campaign' });
  }
});

// Update a specific campaign by ID
campaignRouter.put('/:id', async (req: Request, res: Response) => {
  const campaignId = req.params.id;
  const { title, description, image, progress, amountRaised, total } = req.body;
  try {
    const updatedCampaign = await Campaign.findByIdAndUpdate(
      campaignId,
      { title, description, image, progress, amountRaised, total },
      { new: true }
    ).populate('donations');
    if (!updatedCampaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    res.status(200).json(updatedCampaign);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error occurred while updating the campaign' });
  }
});

// Delete a specific campaign by ID
campaignRouter.delete('/:id', async (req: Request, res: Response) => {
  const campaignId = req.params.id;
  try {
    // Find the campaign
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Delete all associated donations
    const deletedDonations = await Donation.deleteMany({ campaign: campaignId });

    // Delete the campaign
    await Campaign.findByIdAndDelete(campaignId);

    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error occurred while deleting the campaign and associated donations' });
  }
});

export default campaignRouter;
