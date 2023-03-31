import {trueLayerAuthApi, trueLayerDataApi} from "../axiosConfig";

beforeEach(() => {
  trueLayerAuthApi.interceptors.request.clear();
  trueLayerDataApi.interceptors.request.clear();
});
