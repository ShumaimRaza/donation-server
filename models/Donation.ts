import { Schema, model, Document } from 'mongoose';
import User, { IUser } from './User'; // Import the User model
import Campaign, { ICampaign } from './Campaign'; // Import the Campaign model

export interface IDonation extends Document {
  donor: IUser['_id']; // Reference to User document
  paymentMethod: string;
  amount: number;
  campaign: ICampaign['_id']; // Reference to Campaign document
}

const donationSchema = new Schema<IDonation>(
  {
    donor: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    campaign: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign', // Reference to the Campaign model
      required: true,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

const Donation = model<IDonation>('Donation', donationSchema);

export default Donation;
