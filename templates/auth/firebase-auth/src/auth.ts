import { auth } from './firebase';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword 
} from 'firebase/auth';

export async function firebaseSignIn(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}