import {AxiosResponse} from "axios";

import {StarlingErrorResponse} from "../../types/starling/error";
import {handleAxiosApiErrorResponse} from "../axiosInterceptors";

const extractError = async ({data}: AxiosResponse<StarlingErrorResponse>) => ({
  error: data.error,
  errorMessage: data.error_description
});

export const handleStarlingError = handleAxiosApiErrorResponse(
  "Starling API",
  extractError
);
