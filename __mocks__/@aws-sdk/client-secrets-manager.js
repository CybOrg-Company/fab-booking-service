export class SecretsManagerClient {
    send(command) {
      if (command.input.SecretId) {
        return Promise.resolve({
          SecretString: JSON.stringify({ MONGO_URI: 'mocked_mongo_uri', RABBITMQ_URI: 'mocked_rabbitmq_uri' }),
        });
      }
      return Promise.reject(new Error('Mocked AWS Secrets Manager Error'));
    }
  }
  
  export class GetSecretValueCommand {
    constructor(input) {
      this.input = input;
    }
  }
  