import {testQueryClient} from "./mocks/utils";

import {trueLayerAuthApi, trueLayerDataApi} from "../axiosConfig";

beforeEach(() => {
  trueLayerAuthApi.interceptors.request.clear();
  trueLayerDataApi.interceptors.request.clear();
});

afterEach(() => {
  jest.clearAllMocks();
  testQueryClient.clear();
});
