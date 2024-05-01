import mongoose from 'mongoose';

const socketSchema = new mongoose.Schema({
  thisId: {
    type: Number,
  },
  otherId: {
    type: Number,
  },
  
});

export const Socket = mongoose.model('socket', socketSchema);

