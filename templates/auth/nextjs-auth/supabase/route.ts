import { supabase } from "./supabase-config";
import type { Session, User } from "@supabase/supabase-js"

type AuthResponse<T = unknown> = {
  data: T | null;
  error: string | null
}

// sign up function
export async function signUp(email: string, password: string): Promise<AuthResponse<User>> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })
  return {
    data: data?.user ?? null,
    error: error?.message ?? null
  }
}


// sign in function
export async function signIn(email: string, password: string): Promise<AuthResponse<User>> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  return {
    data: data?.user ?? null,
    error: error?.message ?? null
  }
}


// reset password function
export async function resetPassword(newPassword: string): Promise<AuthResponse<User>> {

  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  return {
    data: data.user ?? null, 
    error: error?.message ?? null
  };
}


// sign out function
export async function logOut(): Promise<AuthResponse<null>> {
  const { error } = await supabase.auth.signOut()
  return {
    data: null,
    error: error?.message ?? null
  }
}


// get current user function
export async function getUser(): Promise<AuthResponse<User>> {
  const { data, error } = await supabase.auth.getUser()

  return {
    data: data?.user ?? null,
    error: error?.message ?? null
  }
}


// get current session function
export async function getSession(): Promise<AuthResponse<Session>> {
  const { data, error } = await supabase.auth.getSession()

  return {
    data: data?.user ?? null,
    error: error?.message ?? null
  }
}