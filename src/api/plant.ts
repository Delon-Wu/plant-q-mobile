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

export function updatePlant(id: string, data: {
  name: string;
  description: string;
  cover: any; // 可以是 File 或 string
}) {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('description', data.description);
  formData.append('cover', data.cover);
  return request.put(`/plant/plants/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

export function deletePlant(id: string) {
  return request.delete(`/plant/plants/${id}/`);
}

export function createPlant(data: {
  name: string;
  description: string;
  cover: File | string;
}) {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('description', data.description);
  formData.append('cover', data.cover);
  return request.post(`/plant/plants/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

export function addPlantRecord(id: string, data: {
  image: File | string;
  remark: string;
}) {
  const formData = new FormData();
  formData.append('remark', data.remark);
  formData.append('image', data.image);
  return request.post(`/plant/plants/record/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

export function deletePlantRecord(recordId: string) {
  return request.delete(`/plant/plants/record/delete/${recordId}`);
}
