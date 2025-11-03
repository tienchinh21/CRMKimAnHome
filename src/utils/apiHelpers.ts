export const API_BASE_URL = "https://kimanhome.duckdns.org/spring-api";

export const extractData = (response: any) => {
  if (response.data?.content === null || response.data?.content === undefined) {
    return response.data;
  }
  return response.data?.content || response.data;
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem("accessToken");
};

export const createFormDataWithJson = (
  data: any,
  files?: File | File[]
): FormData => {
  const formData = new FormData();

  const dataBlob = new Blob([JSON.stringify(data)], {
    type: "application/json",
  });

  formData.append("data", dataBlob, "data.json");

  if (files) {
    if (Array.isArray(files)) {
      files.forEach((file) => {
        formData.append("file", file);
      });
    } else {
      formData.append("file", files);
    }
  }

  return formData;
};
