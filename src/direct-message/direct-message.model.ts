import * as mongo from 'mongoose';

export const DirectMessageSchema = new mongo.Schema(
  {
    roomId: { type: String, required: true, index: true },
    senderId: { type: mongo.Schema.Types.ObjectId, ref: 'Auth', required: true },
    text: { type: String, required: true, trim: true },
    messageType: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
    mediaUrl: { type: String, default: null },
    readBy: [{ type: mongo.Schema.Types.ObjectId, ref: 'Auth' }],
  },
  { timestamps: true }
);

export interface DirectMessage extends mongo.Document {
  roomId: string;
  senderId: mongo.Types.ObjectId | string;
  text: string;
  messageType: 'text' | 'image' | 'file';
  mediaUrl?: string;
  readBy?: mongo.Types.ObjectId[] | string[];
  createdAt?: Date;
  updatedAt?: Date;
}