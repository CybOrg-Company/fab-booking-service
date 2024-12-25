const mongoose = {
    connect: jest.fn().mockResolvedValue(),
    model: jest.fn(() => ({
      findOneAndUpdate: jest.fn().mockResolvedValue({}),
    })),
    Schema: class {
      constructor() {}
    },
  };
  
  export default mongoose;
  