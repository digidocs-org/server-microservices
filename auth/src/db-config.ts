import * as mongoose from 'mongoose';

export class DatabaseConfig {
  public static async connect() {
    await mongoose.connect(process.env.MONGO_URI!, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
  }
}