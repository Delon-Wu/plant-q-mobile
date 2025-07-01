import request from '@/src/utils/request';

export function getTaskList() {
  return request.get('/task/')
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
  return request.post('/task/', data)
}

export function updateTask(id: number, data: any) {
  return request.put(`/task/${id}/`, data)
}

export function deleteTask(id: number) {
  return request.delete(`/task/${id}/`)
}

export function getTaskHistory(id: number) {
  return request.get(`/task/${id}/history/`)
}

export function getTaskHistoryDetail(id: number) {
  return request.get(`/task/history/${id}/`)
}