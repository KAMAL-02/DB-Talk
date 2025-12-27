import { useState } from "react";

type ApiError = {
  message: string;
  status: number;
};

const useApi = (requestFn: (...args: any[]) => Promise<any>) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const handleRequest = async (...args: any[]) => {
    setLoading(true);
    setError(null);

    try {
      const response = await requestFn(...args);
      return response;
    } catch (err: any) {
      const response = err?.response;
      console.log("API Error Response:", response);

      setError({
        message:
          response?.data?.error ||
          response?.data?.message ||
          err?.message ||
          "An error occurred",
        status: response?.status || 500,
      });

      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, handleRequest };
};

export default useApi;
