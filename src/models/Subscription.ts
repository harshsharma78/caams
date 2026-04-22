import { InferSchemaType, Schema, model, models } from 'mongoose';

const subscriptionSchema = new Schema(
  {
    orgId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
    },
    plan: {
      type: String,
      enum: ['free', 'starter', 'professional', 'enterprise'],
      default: 'free',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'trial', 'cancelled', 'past_due'],
      default: 'active',
      required: true,
    },
    amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isTrial: {
      type: Boolean,
      default: false,
    },
    convertedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    currentPeriodStart: {
      type: Date,
      default: Date.now,
    },
    currentPeriodEnd: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'subscriptions',
  },
);

export type SubscriptionDocument = InferSchemaType<typeof subscriptionSchema>;

const Subscription =
  models.Subscription || model('Subscription', subscriptionSchema);

export default Subscription;
