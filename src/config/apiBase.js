const REMOTE_URL = "https://baggiest-sterigmatic-kandi.ngrok-free.dev";
const LOCAL_URL = "http://localhost:5000";

const envOverride = process.env.EXPO_PUBLIC_API_BASE_URL;

const BASE =
  typeof envOverride === "string" && envOverride.length > 0
    ? envOverride
    : __DEV__
    ? LOCAL_URL
    : REMOTE_URL;

export default BASE;
