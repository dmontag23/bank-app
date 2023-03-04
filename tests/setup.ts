import {server} from "./mocks/server";
// Establish API mocking before all tests.
beforeAll(() => server.listen());
// Reset any jest mocks and request handlers added during the tests,
// so they don't affect other tests.
afterEach(() => {
  jest.clearAllMocks();
  server.resetHandlers();
});
// Clean up after the tests are finished.
afterAll(() => server.close());
