import mongoose, { Schema, Document } from 'mongoose';

export interface IOutlet extends Document {
  name: string;
  createdBy: mongoose.Types.ObjectId;
  adminUserId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const OutletSchema = new Schema<IOutlet>({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  adminUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent re-compilation during development
export default mongoose.models.Outlet || mongoose.model<IOutlet>('Outlet', OutletSchema);