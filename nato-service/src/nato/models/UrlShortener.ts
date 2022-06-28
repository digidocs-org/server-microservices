import mongoose, { Schema, Document } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

export interface IUrlShortener extends Document {
    urlCode: string
    longUrl: string
    shortUrl: string
    expireTime: number
}

const urlShortenerSchema = new Schema(
    {
        urlCode: { type: String, require: true },
        longUrl: { type: String, require: true },
        shortUrl: { type: String, require: true },
        expireTime: { type: String },
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

urlShortenerSchema.set('versionKey', 'version');
urlShortenerSchema.plugin(updateIfCurrentPlugin);

const UrlShortener = mongoose.model<IUrlShortener>('url-shortener', urlShortenerSchema);

export default UrlShortener;
