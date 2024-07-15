import { Schema, model, Document } from 'mongoose';

export interface INGO extends Document {
  title: string;
  icon: string;
  Zakat_Rating: number;
  Fitrana_Rating: number;
  Sadqa_Rating: number;
  Fidya_Rating: number;
  Flood_Relief_Rating: number;
  Ramazan_Package_Rating: number;
  Kaffara_Rating: number;
  Earthquake_Rating: number;
  Khairat_Rating: number;
  Orphan_Care_Rating: number;
  Khummas_Rating: number;
  Education_Rating: number;
  Marriage_Rating: number;
  Old_Age_Home_Rating: number;
  Aqiqah_Rating: number;
}

const ngoSchema = new Schema<INGO>({
  title: { type: String, required: true },
  icon: { type: String, required: true },
  Zakat_Rating: { type: Number, default: 5 },
  Fitrana_Rating: { type: Number, default: 5 },
  Sadqa_Rating: { type: Number, default: 5 },
  Fidya_Rating: { type: Number, default: 5 },
  Flood_Relief_Rating: { type: Number, default: 5 },
  Ramazan_Package_Rating: { type: Number, default: 5 },
  Kaffara_Rating: { type: Number, default: 5 },
  Earthquake_Rating: { type: Number, default: 5 },
  Khairat_Rating: { type: Number, default: 5 },
  Orphan_Care_Rating: { type: Number, default: 5 },
  Khummas_Rating: { type: Number, default: 5 },
  Education_Rating: { type: Number, default: 5 },
  Marriage_Rating: { type: Number, default: 5 },
  Old_Age_Home_Rating: { type: Number, default: 5 },
  Aqiqah_Rating: { type: Number, default: 5 },
});

const Ngo = model<INGO>('NGO', ngoSchema);

export default Ngo;
