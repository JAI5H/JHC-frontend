import { apiClient } from "./client";

export type ContactRequest = {
  fullName: string;
  company: string;
  phone: string;
  email: string;
  service: string;
  message: string;
};

export async function submitContactForm(payload: ContactRequest) {
  return apiClient.post("/api/contact", payload);
}
