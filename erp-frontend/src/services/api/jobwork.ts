import { api } from "./client";

const ENDPOINT = "/jobwork";

export interface JobWork {
  _id: string;
  jobNumber: string;
  jobType: "Printed" | "Printed+SpotUV";
  inventoryRef: any;
  materialName: string;
  quantity: number;
  status: "Pending" | "Completed";
  outputInventoryRef: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobWorkData {
  jobNumber: string;
  jobType: "Printed" | "Printed+SpotUV";
  inventoryRef: string;
  quantity: number;
}

export async function getJobWorks(): Promise<{ data: JobWork[] }> {
  try {
    const response = await api.get(ENDPOINT);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch job works", error);
    return { data: [] };
  }
}

export async function createJobWork(data: CreateJobWorkData): Promise<{ data: JobWork }> {
  const response = await api.post(ENDPOINT, data);
  return response.data;
}

export async function completeJobWork(id: string): Promise<{ data: JobWork }> {
  const response = await api.patch(`${ENDPOINT}/${id}/complete`);
  return response.data;
}
