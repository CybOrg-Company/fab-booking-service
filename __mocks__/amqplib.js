export const connect = jest.fn().mockResolvedValue({
    createChannel: jest.fn().mockResolvedValue({
      assertQueue: jest.fn().mockResolvedValue(),
      bindQueue: jest.fn().mockResolvedValue(),
      sendToQueue: jest.fn().mockImplementation(() => console.log('Message sent to mock queue')),
    }),
  });
  