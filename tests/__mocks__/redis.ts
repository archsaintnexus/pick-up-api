import { jest } from "@jest/globals";

export default {
  get: jest.fn().mockResolvedValue(null as never),
  set: jest.fn().mockResolvedValue("OK" as never),
  del: jest.fn().mockResolvedValue(1 as never),
  on: jest.fn(),
  quit: jest.fn().mockResolvedValue("OK" as never),
};
