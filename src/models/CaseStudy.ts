import { InferSchemaType, Schema, model, models } from 'mongoose';

const caseStudySchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    orgId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    sector: { type: String, required: true, trim: true },
    challenge: { type: String, required: true, trim: true },
    solution: { type: String, required: true, trim: true },
    outcome: { type: String, required: true, trim: true },
    results: { type: String, required: true, trim: true },
    tags: [{ type: String, trim: true }],
    fileUrl: { type: String, default: '' },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export type CaseStudyDocument = InferSchemaType<typeof caseStudySchema>;

const CaseStudy = models.CaseStudy || model('CaseStudy', caseStudySchema);

export default CaseStudy;
