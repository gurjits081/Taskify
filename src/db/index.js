import mongoose from "mongoose";

const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected')
    } catch (error) {
        console.log('Failed To Connect To MongoDB: ', error)
    }
}

export default connectDB;