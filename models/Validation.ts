import { Schema, model, Document, Types } from 'mongoose';
import { IUser } from './User';

export interface IValidation extends Document {
    token: string;
    user: IUser | Types.ObjectId;
}

const validationSchema = new Schema<IValidation>({
    token: {
        type: String,
        required: true,
        match: /^\d{6}$/,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    }
}, {
    timestamps: true 
});

const ValidationLog = model<IValidation>('Validation', validationSchema);

export default ValidationLog;
