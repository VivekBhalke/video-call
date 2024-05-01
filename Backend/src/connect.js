import mongoose from 'mongoose';
import env from "dotenv";
env.config();
const url = process.env.URL;
console.log(url);
function connectDb(){
    mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    const db = mongoose.connection;

    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    db.once('open', function() {
        console.log('MongoDB connected');
    });
}
export default connectDb;
