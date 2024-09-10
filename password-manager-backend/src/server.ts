import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import Password from '../models/Password';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

app.post('/api/passwords', async (req, res) => {
  try {
    const { site, username, password } = req.body;
    const newPassword = new Password({ site, username, password });
    await newPassword.save();
    res.status(201).json(newPassword);
  } catch (error) {
    res.status(500).json({ message: 'Error saving password', error });
  }
});

app.get('/api/passwords', async (req, res) => {
  try {
    const passwords = await Password.find();
    res.json(passwords);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching passwords', error });
  }
});

app.delete('/api/passwords/:id', async (req, res) => {
  try {
    await Password.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting password', error });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
