import Constants from "expo-constants";

const extra = Constants?.expoConfig?.extra ?? Constants?.manifest?.extra ?? {};

const REQUIRED = [
  {
    path: ["huggingface", "token"],
    env: "HUGGINGFACE_TOKEN",
    message:
      "Hugging Face access token is missing. Set HUGGINGFACE_TOKEN in your .env so text and image models can run."
  },
  {
    path: ["googleVision", "apiKey"],
    env: "GOOGLE_VISION_API_KEY",
    message: "Google Vision API key is missing. Set GOOGLE_VISION_API_KEY to enable scene analysis for uploaded photos."
  }
];

function getNestedValue(source, path) {
  return path.reduce((value, key) => (value ? value[key] : undefined), source);
}

export function warnMissingConfig() {
  const missing = REQUIRED.filter(({ path }) => {
    const value = getNestedValue(extra, path);
    return !value || value === "undefined";
  });

  if (!missing.length) {
    return;
  }

  const details = missing
    .map(({ env, message }) => `• ${env}: ${message}`)
    .join('\n');

  console.warn(
    ['[config] Optional warning — some AI features may be degraded until you provide the following keys:', details].join('\n')
  );
}
