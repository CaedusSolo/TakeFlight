import { auth } from './firebase-config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  type User,
  type AuthError,
  type Unsubscribe
} from 'firebase/auth';

type AuthResponse = {
  user: User | null;
  error: string | null
}

type SuccessResponse = {
  success: boolean;
  error: string | null
}

// sign up function
export async function signUp(email: string, password: string): Promise<AuthResponse> {
  try {
    const userCredentials = await createUserWithEmailAndPassword(auth, email, password)
    return {
      user: userCredentials.user,
      error: null
    }
  }
  catch (error) {
    const err = error as AuthError // note for ts, error cannot be directly annotated  
    return {
      user: null,
      error: err.message
    }
  }
}

// sign in function
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const userCredentials = await signInWithEmailAndPassword(auth, email, password)
    return {
      user: userCredentials.user,
      error: null
    }
  }
  catch (error) {
    const err = error as AuthError 
    return {
      user: null,
      error: err.message
    }
  }
}

// sign out function
export async function logOut(): Promise<SuccessResponse> {
  try {
    await signOut(auth)
    return {
      success: true,
      error: null
    }
  }
  catch (error) {
    const err = error as AuthError 
    return {
      success: false,
      error: err
    }
  }
}

// reset password function
export async function resetPassword(email: string): Promise<SuccessResponse> {
  try {
    await sendPasswordResetEmail(auth, email)
    return {
      success: true,
      error: null
    }
  }
  catch (error) {
    const err = error as AuthError 
    return {
      success: false,
      error: err.message
    }
  }
}

