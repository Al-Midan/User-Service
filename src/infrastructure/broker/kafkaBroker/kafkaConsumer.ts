import { KafkaModule } from "../../../utils/kafka/kafkaModule";
import { handleGetuserDetails } from "../../../presentation/routes/userRouter"; 

class KafkaConsumer extends KafkaModule {
  constructor() {
   // super('user-service-consumer', ['localhost:9092']);
   super('user-service-producer', ['kafka:29092']);
  }

  async consumeUserDetails(): Promise<void> {
    await this.connect();
    await this.subscribeToTopic('userDetails-request');
    await this.runConsumer(async (message) => {
      const messageData = JSON.parse(message.value!.toString());
      await handleGetuserDetails(messageData.userId);
    });
  }
}

const kafkaConsumer = new KafkaConsumer();
export const consumeUserDetails = () => kafkaConsumer.consumeUserDetails();