import request from '@/src/utils/request';

export function plantList() {
  return request.get('/plant/');
}
