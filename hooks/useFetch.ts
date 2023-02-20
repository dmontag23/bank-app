import {useEffect, useState} from "react";
import {AUTH_TOKEN} from "../integrations/StarlingBank/constants";

const useFetch = (url: string) => {
  const [apiResponse, setApiResponse] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${AUTH_TOKEN}`
          }
        });
        if (!response.ok) throw new Error(`Returned ${response.status}`);
        const json = await response.json();
        setApiResponse(json);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [url, setApiResponse]);

  return apiResponse;
};

export default useFetch;
