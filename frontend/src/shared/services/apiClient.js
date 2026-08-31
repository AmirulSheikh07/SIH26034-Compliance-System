// SIH 26034 - PackSure: API Client Configuration
// This helper handles requests to the FastAPI backend with an automatic fallback to local mock data 
// if the backend server is offline or fails to respond.

const BASE_URL = 'http://localhost:8000/api/v1'; // Default FastAPI server port

export const apiRequest = async (endpoint, options = {}, fallbackData = null) => {
  const url = `${BASE_URL}${endpoint}`;
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API response error: Status ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn(`[PackSure API Client] Connection to ${url} failed. Falling back to local database.`, error);
    
    if (fallbackData !== null) {
      return fallbackData;
    }
    throw error;
  }
};
