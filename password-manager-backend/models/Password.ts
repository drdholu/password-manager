import mongoose, { Schema, Document } from 'mongoose';

export interface IPassword extends Document {
  site: string;
  username: string;
  password: string;
}

const PasswordSchema: Schema = new Schema({
  site: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
});

export default mongoose.model<IPassword>('Password', PasswordSchema);
