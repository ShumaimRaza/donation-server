import { Schema, model, Document } from 'mongoose';

// Interface for the profile schema
export interface IProfile extends Document {
  profilePicture: string;
  likedUsers: Schema.Types.ObjectId[];
  dislikedUsers: Schema.Types.ObjectId[];
  bio: string;
  gender: 'Male' | 'Female';
  dob: {
    day: number;
    month: number;
    year: number;
  };
  location: {
    type: string;
    coordinates: number[];
  };
  donation: IDonation; // Include the donation fields
}

// Donation schema interface
interface IDonation extends Document {
  Zakat: number;
  Fitrana: number;
  Sadqa: number;
  Fidya: number;
  Flood_Relief: number;
  Ramazan_Package: number;
  Kaffara: number;
  Earthquake: number;
  Khairat: number;
  Orphan_Care: number;
  Khummas: number;
  Education: number;
  Marriage: number;
  Old_Age_Home: number;
  Aqiqah: number;
}

// Define donation schema
const donationSchema = new Schema<IDonation>({
  Zakat: { type: Number, default: 0 },
  Fitrana: { type: Number, default: 0 },
  Sadqa: { type: Number, default: 0 },
  Fidya: { type: Number, default: 0 },
  Flood_Relief: { type: Number, default: 0 },
  Ramazan_Package: { type: Number, default: 0 },
  Kaffara: { type: Number, default: 0 },
  Earthquake: { type: Number, default: 0 },
  Khairat: { type: Number, default: 0 },
  Orphan_Care: { type: Number, default: 0 },
  Khummas: { type: Number, default: 0 },
  Education: { type: Number, default: 0 },
  Marriage: { type: Number, default: 0 },
  Old_Age_Home: { type: Number, default: 0 },
  Aqiqah: { type: Number, default: 0 },
});

// Profile schema definition
const profileSchema = new Schema<IProfile>({
  profilePicture: { type: String, required: false },
  bio: { type: String },
  gender: { type: String, enum: ['Female', 'Male'] },
  dob: {
    day: { type: Number },
    month: { type: Number },
    year: { type: Number },
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: false,
    },
    coordinates: {
      type: [Number],
      required: false,
    },
  },
  donation: { type: donationSchema, default: {} }, // Include donation field
});

// Profile model
const Profile = model<IProfile>('Profile', profileSchema);

export default Profile;
