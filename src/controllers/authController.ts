import { Request, Response } from 'express';
import { firestore } from '../config/firestore';
import { firebase, verifyIdToken } from '../config/fireauth';

// Model
import { User } from '../models/user';


// Register
export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, address } = req.body;

  // Validate input
  if ( !name || !email || !password || !address) {
    res.status(400).json({
      status: 'error',
      message: 'All fields (name, email, password, address) are required.',
    });
    return;
  }

  try {
    // Create new user, Firebase Auth
    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);

    if (!userCredential.user) {
      throw new Error('User not found');
    }
    const uid = userCredential.user.uid;

    const newUser : User = {
      name,
      email,
      address,
    };

    // Create new user, Firestore
    await firestore.collection('users').doc(uid).set(newUser);

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      user: newUser,
    });
    return;
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to register user.',
      error: (error instanceof Error) ? error.message : 'Unknown error',
    });
    return;
  }
};

// Login
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    res.status(400).json({
      status: 'error',
      message: 'Email and password are required.',
    });
    return;
  }

  try {
    // Sign in user, Firebase Auth
    const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      
    if (!userCredential.user) {
      throw new Error('User not found');
    }
    const idToken = await userCredential.user.getIdToken();

    // Verify the ID token
    const decodedToken = await verifyIdToken(idToken);

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      token: `Bearer ${idToken}`,
      user: decodedToken,
    });
    return;
  } catch (error) {
    console.error("Error during login:", error);
    res.status(401).json({
      status: 'error',
      message: 'Invalid email or password.',
    });
    return;
  }
};
