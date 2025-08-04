import request from '@/src/utils/request';

export function plantRecogonize(data: FormData) {
  return request.post<{
    "result": string,
    "most_likely_kind": string
  }>('/foundation/plant-recognization', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 60000, // 图片上传可能需要更长时间
  });
}
