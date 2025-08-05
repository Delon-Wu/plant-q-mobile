import request from '@/src/utils/request';

export function track(data: {
    "event": string;
    "detail": string;
    "userId"?: string;
}) {
  return request.post('/foundation/track', data);
}
