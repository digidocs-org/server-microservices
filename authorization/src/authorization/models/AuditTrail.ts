import mongoose, { Schema, Document } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

export interface IAuditTrail extends Document {
  receive?: Date;
  view?: Date;
  sign?: Date;
  ip?: String;
  cancel?: Date;
}

const auditTrailSchema = new Schema(
  {
    receive: {
      type: Schema.Types.Date,
    },
    view: {
      type: Schema.Types.Date,
    },
    sign: {
      type: Schema.Types.Date,
    },
    cancel: {
      type: Schema.Types.Date,
    },
    ip: {
      type: Schema.Types.String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

auditTrailSchema.set('versionKey', 'version');
auditTrailSchema.plugin(updateIfCurrentPlugin);

const AuditTrail = mongoose.model<IAuditTrail>('auditTrail', auditTrailSchema);

export default AuditTrail;
