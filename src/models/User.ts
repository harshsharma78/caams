import { InferSchemaType, Schema, model, models } from 'mongoose';

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.provider || this.provider === 'credentials';
      },
    },
    provider: {
      type: String,
      enum: ['credentials', 'google', 'github'],
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'assessor'],
      default: 'assessor',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'suspended'],
      default: 'active',
      required: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    activeSessionToken: {
      type: String,
      default: '',
      trim: true,
    },
    sessionExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export type UserDocument = InferSchemaType<typeof userSchema>;

const User = models.User || model('User', userSchema);

export default User;
