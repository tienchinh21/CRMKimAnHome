declare module "axios" {
  // Minimal typing shim to satisfy TS until axios is installed
  export type AxiosInstance = any;
  const axios: any;
  export default axios;
}
