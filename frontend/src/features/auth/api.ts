import { api } from "@/lib/api";

export async function register(
  username: string,
  email: string,
  password: string
) {
  const response = await api.post("/users/register", {
    username,
    email,
    password,
  });

  return response.data;
}

export async function login(email: string, password: string) {
  const response = await api.post("/users/login", {
    email,
    password,
  });

  return response.data;
}
