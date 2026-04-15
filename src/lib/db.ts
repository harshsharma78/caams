import mongoose from 'mongoose';

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

export async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    return;
  }

  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('Missing environment variable: MONGODB_URI');
    }

    const db = await mongoose.connect(mongoUri);

    connection.isConnected = db.connections[0].readyState;
  } catch (error) {
    console.error('Database connection failed', error);
    throw error;
  }
}
