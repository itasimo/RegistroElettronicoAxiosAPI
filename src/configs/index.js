// Import JSON configuration
import axiosConfig from './axios.json' with { type: 'json' };

// Re-export all keys from the JSON file
export const { rc4key, VendorToken } = axiosConfig;

// Default export
export default axiosConfig;
