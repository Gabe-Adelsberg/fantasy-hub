import { api } from "@/lib/api";

export async function login(email: string, password: string) {
  const response = await api.post("/users/login", {
    email,
    password,
  });

  return response.data;
}