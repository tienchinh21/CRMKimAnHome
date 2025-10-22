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

  // Create a Blob with application/json type for Spring Boot @RequestPart
  const dataBlob = new Blob([JSON.stringify(data)], {
    type: "application/json",
  });

  // Append as "data" part with filename to help Spring Boot parse it correctly
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
