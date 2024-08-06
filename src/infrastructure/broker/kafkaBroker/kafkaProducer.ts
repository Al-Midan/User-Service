import { KafkaModule } from '../../../utils/kafka/kafkaModule';

class KafkaProducer extends KafkaModule {
  constructor() {
    //super('user-service-producer', ['localhost:9092']);
    super('user-service-producer', ['kafka:29092']);
  }

  async senduserDetailsResponse(userId: string, userDetails: any): Promise<void> {
    console.log('Sending to Kafka:', { userId, userDetails });
    await this.sendMessage('userDetails-response', userId, { userId, userDetails });
  }
}

export const kafkaProducer = new KafkaProducer();

// Export the function separately
export const senduserDetailsResponse = (userId: string, userDetails: any) => 
  kafkaProducer.senduserDetailsResponse(userId, userDetails);