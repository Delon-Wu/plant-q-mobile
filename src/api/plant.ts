import request from '@/src/utils/request';

type Plant = {
  name: string;
  id: string | number;
  cover: string;
  records: {
    "id": number | string,
    "plant": number | string,
    "image": string;
    "record_time": string;
    "remark": string;
    "created_at": string;
  }[],
  created_at: string
}
export function plantList() {
  return request.get<Plant[]>('/plant/plants/');
}

export function getPlantDetail(id: string) {
  return request.get<Plant>(`/plant/plants/${id}/`);
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

export function addPlantRecord(id: string, data: {
  image: File | string;
  remark: string;
}) {
  const formData = new FormData();
  formData.append('remark', data.remark);
  formData.append('image', data.image);
  return request.post(`/plant/plants/record/${id}/`, formData);
}

export function deletePlantRecord(recordId: string) {
  return request.delete(`/plant/plants/record/${recordId}`);
}
