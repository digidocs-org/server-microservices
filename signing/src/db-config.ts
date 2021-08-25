import mongoose from "mongoose";
import { DatabaseConnectionError } from "@digidocs/guardian";

export class DatabaseConfig {
  public static async connect() {
    try {
     await mongoose.connect(process.env.MONGO_URI! || '', {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
      });
      console.log('DB Running...');
    } catch (error) {
      throw new DatabaseConnectionError()
    }
    mongoose.set('useFindAndModify', false);
  }
}