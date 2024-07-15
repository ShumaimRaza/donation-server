import { Schema, model, Document } from 'mongoose';

export interface IMessage extends Document {
  sender: Schema.Types.ObjectId;
  text: string;
  timestamp: Date;
  type: 'text' | 'image' | 'video' | 'audio' | 'file';
  readAt: Date | null;
}


const messageSchema = new Schema<IMessage>({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'file'],
    required: true,
  },
  readAt: {
    type: Date,
    default: null,
  },
});

const Message = model<IMessage>('Message', messageSchema);
export default Message;
