import { axiosInstance } from "./axios";

export interface StreamTokenResponse {
  token: string;
}

export async function getStreamToken(): Promise<StreamTokenResponse> {
  const response = await axiosInstance.get<StreamTokenResponse>("/chat/token");
  return response.data;
}

export async function summarizeChannelMessages(messages: any[]): Promise<{ summary: string }> {
  const response = await axiosInstance.post<{ summary: string }>("/chat/summarize", { messages });
  return response.data;
}

export async function getSmartReplies(messages: any[]): Promise<{ replies: string[] }> {
  const response = await axiosInstance.post<{ replies: string[] }>("/chat/smart-replies", { messages });
  return response.data;
}
