import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: {
    type: Number,
  },
  password: {
    type: String,
  },
  roomId : {
    type : Number,
  }
});

export const User = mongoose.model('users', userSchema);

