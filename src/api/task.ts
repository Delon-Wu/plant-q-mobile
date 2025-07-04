import request, { ApiResponse } from '@/src/utils/request';
import { DurationType } from '../types/task';

export function getTaskList() {
  return request.get<ApiResponse<{
    "id": number;
    "user": number;
    "plant": string;
    "is_completed": false;
    "task_type": string;
    "duration_type": DurationType;
    "start_time": Date | null;
    "end_time": Date | null;
    "time_at_once": Date | null;
    "remark": string;
    "interval_days": number;
    "created_at": string;
    "updated_at": string;
  }[]>>('/task/operate/')
}

export function getTaskDetail(id: number) {
  return request.get(`/task/${id}/`)
}

export function createTask(data: {
  type: string;
  plant: string;
  duration_type: string;
  remark: string;
  start_time?: number;
  end_time?: number;
  interval_days?: number;
  time_at_once?: number;
}
) {
  return request.post('/task/operate/', data)
}

export function updateTask(id: number, data: any) {
  return request.put(`/task/operate/${id}/`, data)
}

export function deleteTask(id: number) {
  return request.delete(`/task/operate/${id}/`)
}

export function getTaskHistory(id: number) {
  return request.get(`/task/operate/${id}/history/`)
}

export function getTaskHistoryDetail(id: number) {
  return request.get(`/task/operate/history/${id}/`)
}