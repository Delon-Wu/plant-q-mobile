import request from '@/src/utils/request';

export function plantRecogonize(data: FormData) {
  return request.post<{
    "result": {
      "score": number,
      "name": string
    }[],
    "log_id": number
  }>('/ai/plant-recognization', data, { headers: { "Content-Type": "multipart/form-data" } });
}