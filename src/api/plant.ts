import request from '@/src/utils/request';

export function plantList() {
  return request.get<{ name: string; id: string; cover: string; timeLine: any[], created_at: string }[]>('/plant/plants/');
}

export function getPlantDetail(id: string) {
  return request.get(`/plant/plants/${id}/`);
}

export function updatePlant(id: string, data: any) {
  return request.put(`/plant/plants/${id}/`, data);
}

export function deletePlant(id: string) {
  return request.delete(`/plant/plants/${id}/`);
}

export function createPlant(data: {
  name: string;
  cover: File | string;
}) {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('cover', data.cover);
  return request.post(`/plant/plants/`, formData);
}

export function addPlantImage(id: string) {
  return request.get(`/plant/plants/${id}/add_image/`);
}
