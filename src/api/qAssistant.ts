import request from '@/src/utils/request';

export function plantRecogonize(data: FormData) {
  return request.post<{
    "result": string,
    "most_likely_kind": string
  }>('/foundation/plant-recognization', data);
}
