import { axiosInstance } from "./axios";

export interface StreamTokenResponse {
  token: string;
}

export async function getStreamToken(): Promise<StreamTokenResponse> {
  const response = await axiosInstance.get<StreamTokenResponse>("/chat/token");
  return response.data;
}
