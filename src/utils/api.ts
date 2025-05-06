// API client utility functions

/**
 * Fetch data from the API
 * @param url API endpoint URL
 * @param options Fetch options
 * @returns Promise with the parsed JSON response
 */
export async function fetchApi(url: string, options?: RequestInit) {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json'
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
  
  /**
   * POST data to the API
   * @param url API endpoint URL
   * @param data Data to send
   * @returns Promise with the parsed JSON response
   */
  export async function postApi(url: string, data: any) {
    return fetchApi(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  /**
   * PUT data to the API
   * @param url API endpoint URL
   * @param data Data to send
   * @returns Promise with the parsed JSON response
   */
  export async function putApi(url: string, data: any) {
    return fetchApi(url, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  
  /**
   * DELETE request to the API
   * @param url API endpoint URL
   * @returns Promise with the parsed JSON response
   */
  export async function deleteApi(url: string) {
    return fetchApi(url, {
      method: 'DELETE'
    });
  }