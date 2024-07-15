import { Schema, model, Document } from 'mongoose';

export interface IChat extends Document {
  users: Schema.Types.ObjectId[];
  messages: Schema.Types.ObjectId[];
  lastMessage: Schema.Types.ObjectId;
  timestamp: Date;
}

const chatSchema = new Schema<IChat>({
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User', 
      required: true,
    },
  ],
  messages: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Message', 
    },
  ],
  lastMessage: {type: Schema.Types.ObjectId, ref: 'Message'},
  timestamp: {type: Date, default: Date.now},
});

const Chat = model<IChat>('Chat', chatSchema);

export default Chat;