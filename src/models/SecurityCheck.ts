import { InferSchemaType, Schema, model, models } from 'mongoose';

const securityCheckSchema = new Schema(
  {
    orgId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    checklist: [
      {
        category: { type: String, required: true, trim: true },
        item: { type: String, required: true, trim: true },
        status: {
          type: String,
          enum: ['pending', 'passed', 'failed', 'not-applicable'],
          required: true,
        },
        riskLevel: {
          type: String,
          enum: ['low', 'medium', 'high', 'critical'],
          required: true,
        },
        notes: { type: String, default: '', trim: true },
      },
    ],
    overallRisk: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    score: { type: Number, default: 0 },
    findings: [{ type: String, trim: true }],
    recommendations: [{ type: String, trim: true }],
    conductedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export type SecurityCheckDocument = InferSchemaType<typeof securityCheckSchema>;

const SecurityCheck =
  models.SecurityCheck || model('SecurityCheck', securityCheckSchema);

export default SecurityCheck;
