import mongoose, { Schema, Document, Model } from "mongoose"
import "dotenv/config"

export async function connectDB(): Promise<void> {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI missing in .env")
    }

    await mongoose.connect(process.env.MONGODB_URI)
    console.log("MongoDB connected")
  } catch (error) {
    if (error instanceof Error) {
      console.error("MongoDB connection failed:", error.message)
    } else {
      console.error("Unknown MongoDB connection error:", error)
    }
    process.exit(1)
  }
}


interface IUser extends Document {
  email: string
  name: string
}


const UserSchema = new Schema<IUser>({
  email: { type: String, required: true },
  name: { type: String, required: true },
})


export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema)


export async function ping(): Promise<{ status: string; timestamp?: Date; error?: string }> {
  try {
    await mongoose.connection.db.admin().ping();
    return { status: "healthy", timestamp: new Date() }
  } catch (err) {
    if (err instanceof Error) {
      return { status: "unhealthy", error: err.message }
    }
    return { status: "unhealthy", error: "Unknown error" }
  }
}
