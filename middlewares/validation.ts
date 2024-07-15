import { IProfile } from '../models/Profile';

export const validateProfileData = (profileData: IProfile): string[] | null => {
  const errors: string[] = [];
  return errors.length > 0 ? errors : null;
};