import { InferSchemaType, Schema, model, models } from 'mongoose';

const organizationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    industry: { type: String, required: true, trim: true },
    size: {
      type: String,
      enum: ['startup', 'sme', 'enterprise'],
      required: true,
    },
    sector: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    contactPerson: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    logoUrl: { type: String, default: '' },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export type OrganizationDocument = InferSchemaType<typeof organizationSchema>;

const Organization =
  models.Organization || model('Organization', organizationSchema);

export default Organization;
