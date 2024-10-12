import mongoose from 'mongoose';

let isConnected = false;

export const connectToDB = async () => {
    mongoose.set('strictQuery', true);

    if (!process.env.MONGODB_URI) return console.log('Not connected to MongoDB');

    if (isConnected) return console.log('=> using existing MongoDB database');

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        isConnected = true;

        console.log('MongoDB Connected');
    } catch (error) {
        console.log(error)
    }
}