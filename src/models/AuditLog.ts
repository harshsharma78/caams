import { InferSchemaType, Schema, model, models } from 'mongoose';

const auditLogSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    userName: {
      type: String,
      default: '',
      trim: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    resource: {
      type: String,
      default: '',
      trim: true,
    },
    ip: {
      type: String,
      default: '',
      trim: true,
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'info',
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'auditlogs',
  },
);

export type AuditLogDocument = InferSchemaType<typeof auditLogSchema>;

const AuditLog = models.AuditLog || model('AuditLog', auditLogSchema);

export default AuditLog;
