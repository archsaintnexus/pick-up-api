import { jest } from "@jest/globals";

const stripe = {
  webhooks: {
    constructEvent: jest.fn(),
  },
  paymentIntents: {
    create: jest.fn(),
  },
};

export default stripe;

export const createPaymentIntent = jest.fn().mockResolvedValue({
  id: "pi_test_mock",
  client_secret: "pi_test_mock_secret",
} as never);
