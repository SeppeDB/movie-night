import type { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "./api";
import type { User } from "../types/User";

function toUser(user: SupabaseUser): User {
  const name = user.user_metadata.name as string | undefined;
  return { id: user.id, email: user.email ?? "", name: name ?? user.email ?? "" };
}

export async function login(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error !== null) throw error;
  return toUser(data.user);
}

export async function signUp(name: string, email: string, password: string): Promise<User | null> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error !== null) throw error;
  return data.session !== null && data.user !== null ? toUser(data.user) : null;
}

export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error !== null) throw error;
}

export async function updateName(name: string): Promise<User> {
  const { data, error } = await supabase.auth.updateUser({ data: { name } });
  if (error !== null) throw error;
  const { error: profileError } = await supabase.from("profiles").update({ name }).eq("id", data.user.id);
  if (profileError !== null) throw new Error(profileError.message);
  return toUser(data.user);
}

export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getSession();
  return data.session !== null ? toUser(data.session.user) : null;
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session !== null ? toUser(session.user) : null);
  });
  return () => data.subscription.unsubscribe();
}
