import { supabase } from "./supabase";

// Registrar novo comerciante
export async function registrarComerciante(email: string, senha: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
  });
  return { data, error };
}

// Login de comerciante existente
export async function loginComerciante(email: string, senha: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });
  return { data, error };
}

// Logout
export async function logoutComerciante() {
  const { error } = await supabase.auth.signOut();
  return { error };
}￼Enter
