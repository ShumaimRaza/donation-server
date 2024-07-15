import mongoose, { Schema, model, Document } from 'mongoose';
import {IProfile} from './Profile';
import {INGO} from './NGO';

export interface IUser extends Document {
  _id: Schema.Types.ObjectId;
  fullname: string;
  username: string;
  email: string;
  password: string;
  role: 'User' | 'Manager' | 'NGO';
  profile:  IProfile | null;
  ngo: INGO | null;
  status: 'Approved' | 'Pending' | 'Rejected';
  emailVerified: boolean;
  pictureVerified: boolean;
}

const userSchema = new Schema<IUser>({
  fullname: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true }, 
  profile: { type: Schema.Types.ObjectId, ref: 'Profile' },
  ngo: { type: Schema.Types.ObjectId, ref: 'NGO' },
  status: {
    type: String,
    enum: ['Approved', 'Pending', 'Rejected'],
    default: 'Pending'
},
emailVerified: { type: Boolean, default: false },
pictureVerified: { type: Boolean, default: false },
});

const User = model<IUser>('User', userSchema);

export default User;