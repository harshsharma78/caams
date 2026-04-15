import { InferSchemaType, Schema, model, models } from 'mongoose';

const assessmentSchema = new Schema(
  {
    orgId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    title: { type: String, required: true, trim: true },
    assessorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    categories: [
      {
        name: { type: String, required: true, trim: true },
        weight: { type: Number, required: true, min: 0 },
        questions: [
          {
            question: { type: String, required: true, trim: true },
            answer: { type: String, default: '', trim: true },
            score: { type: Number, required: true, min: 0 },
          },
        ],
      },
    ],
    totalScore: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    recommendation: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: ['draft', 'in-progress', 'completed'],
      default: 'draft',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export type AssessmentDocument = InferSchemaType<typeof assessmentSchema>;

const Assessment = models.Assessment || model('Assessment', assessmentSchema);

export default Assessment;
