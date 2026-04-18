import api from "@/lib/axios";

export const request = async (config) => {
  const response = await api(config);
  return response.data;
};

export const requestData = async (config) => {
  const payload = await request(config);
  return payload?.data ?? null;
};

export const requestResource = async (config, resourceKey) => {
  const data = await requestData(config);

  if (!resourceKey) {
    return data;
  }

  return data?.[resourceKey] ?? null;
};
