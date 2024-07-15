import { Schema, model, Document } from 'mongoose';
import Donation, { IDonation } from './Donation';
import { INGO } from './NGO';

interface IClickCount {
  date: Date; 
  count: number; 
}

export interface ICampaign extends Document {
  title: string;
  type: "Zakat" | "Fitrana" | "Sadqa" | "Fidya" | "Flood_Relief" | "Ramazan_Package" | "Kaffara" | "Earthquake" | "Khairat" | "Orphan_Care" | "Khummas" | "Education" | "Marriage" | "Old_Age_Home" | "Aqiqah";
  description: string;
  image: string;
  progress: number;
  amountRaised: number;
  total: number;
  donations: IDonation[];
  ngo: INGO | null;
  clicks: IClickCount[];
}

const campaignSchema = new Schema<ICampaign>({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Zakat', 'Fitrana', 'Sadqa', 'Fidya', 'Flood_Relief', 'Ramazan_Package', 'Kaffara', 'Earthquake', 'Khairat', 'Orphan_Care', 'Khummas', 'Education', 'Marriage', 'Old_Age_Home', 'Aqiqah'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  progress: {
    type: Number,
    required: true,
  },
  amountRaised: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  donations: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Donation', 
    },
  ],
  ngo: {
    type: Schema.Types.ObjectId,
    ref: 'NGO',
  },
  clicks: [
    {
      date: Date,
      count: { type: Number, default: 0 }, 
    },
  ]
});

const Campaign = model<ICampaign>('Campaign', campaignSchema);

export default Campaign;
