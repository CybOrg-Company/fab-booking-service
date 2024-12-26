const axios = {
    get: jest.fn((url) => {
      return Promise.resolve({ data: { id: 'mocked_id', details: 'mocked_data' } });
    }),
  };
  
  export default axios;
  