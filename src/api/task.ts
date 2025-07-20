import request, { ApiResponse } from '@/src/utils/request';
import { DurationType } from '../types/task';

type TaskID = string;
interface TaskInfo {
  "id": TaskID;
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
}

export function getTaskList() {
  return request.get<ApiResponse<TaskInfo[]>>('/task/operate/')
}

export function getTaskDetail(id: TaskID) {
  return request.get<ApiResponse<TaskInfo>>(`/task/operate/${id}/`)
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

export function updateTask(id: TaskID, data: any) {
  return request.put(`/task/operate/${id}/`, data)
}

export function deleteTask(id: TaskID) {
  return request.delete(`/task/operate/${id}/`)
}

export function getTaskHistory(id: TaskID) {
  return request.get(`/task/operate/${id}/history/`)
}

export function getTaskHistoryDetail(id: number) {
  return request.get(`/task/operate/history/${id}/`)
}