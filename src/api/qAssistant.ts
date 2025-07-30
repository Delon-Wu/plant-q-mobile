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

export function chat(data: {
  model?: "deepseek-chat";
  messages: any[];
  temperature?: number;
  max_tokens?: number;
}, authValue: string) {
  return request.post<{
    // TODO: 待完善
    // "result": {
    //   "score": number,
    //   "name": string
    // }[],
    // "log_id": number
  }>('/ai/chat', {
    model: data.model,
    stream: true,
    temperature: 0.7,
    max_tokens: 2048,
    ...data,
  }, { headers: { "Content-Type": "application/json", "Accept": "text/event-stream" } });
}