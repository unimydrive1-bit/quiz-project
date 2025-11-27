import client from "./client";

export const login = (username, password) =>
  client.post("auth/login/", { username, password });

export const register = (payload) =>
  client.post("auth/register/", payload);
