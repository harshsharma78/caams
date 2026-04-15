import { InferSchemaType, Schema, model, models } from 'mongoose';

const interviewSchema = new Schema({
  orgId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  intervieweeName: { type: String, required: true, trim: true },
  designation: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  experience: { type: String, required: true, trim: true },
  responses: [
    {
      question: { type: String, required: true, trim: true },
      answer: { type: String, default: '', trim: true },
    },
  ],
  fileUrl: { type: String, default: '' },
  conductedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: { type: Date, default: Date.now },
});

export type InterviewDocument = InferSchemaType<typeof interviewSchema>;

const Interview = models.Interview || model('Interview', interviewSchema);

export default Interview;
