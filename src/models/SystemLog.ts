import { InferSchemaType, Schema, model, models } from 'mongoose';

const systemLogSchema = new Schema(
  {
    path: {
      type: String,
      default: '',
      trim: true,
    },
    method: {
      type: String,
      default: 'GET',
      trim: true,
    },
    statusCode: {
      type: Number,
      default: 200,
    },
    responseTimeMs: {
      type: Number,
      default: 0,
      min: 0,
    },
    requestId: {
      type: String,
      default: '',
      trim: true,
    },
    sessionToken: {
      type: String,
      default: '',
      trim: true,
    },
    level: {
      type: String,
      enum: ['info', 'warning', 'error'],
      default: 'info',
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'systemlogs',
  },
);

export type SystemLogDocument = InferSchemaType<typeof systemLogSchema>;

const SystemLog = models.SystemLog || model('SystemLog', systemLogSchema);

export default SystemLog;
