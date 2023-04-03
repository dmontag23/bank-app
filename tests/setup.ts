import {testQueryClient} from "./mocks/utils";

afterEach(() => {
  jest.resetAllMocks();
  testQueryClient.clear();
});
