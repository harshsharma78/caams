import { InferSchemaType, Schema, model, models } from 'mongoose';

const assessmentQuestionSchema = new Schema(
  {
    id: { type: String, required: true, trim: true },
    prompt: { type: String, required: true, trim: true },
    score: { type: Number, required: true, min: 1, max: 5 },
  },
  { _id: false },
);

const assessmentCategorySchema = new Schema(
  {
    key: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    weight: { type: Number, required: true, min: 0 },
    rawScore: { type: Number, required: true, min: 0 },
    averageScore: { type: Number, required: true, min: 0, max: 5 },
    percentageScore: { type: Number, required: true, min: 0, max: 100 },
    weightedScore: { type: Number, required: true, min: 0, max: 100 },
    questions: {
      type: [assessmentQuestionSchema],
      default: [],
    },
  },
  { _id: false },
);

const assessmentSchema = new Schema(
  {
    orgId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    assessorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    categories: {
      type: [assessmentCategorySchema],
      default: [],
    },
    overallScore: { type: Number, required: true, min: 0, max: 100 },
    recommendation: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['not-ready', 'partially-ready', 'mostly-ready', 'cloud-ready'],
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  },
);

export type AssessmentDocument = InferSchemaType<typeof assessmentSchema>;

const Assessment = models.Assessment || model('Assessment', assessmentSchema);

export default Assessment;
