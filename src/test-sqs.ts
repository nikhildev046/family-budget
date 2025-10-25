import { AWSServices } from './config/aws';
import { config } from './config/env';

async function testSQS() {
  console.log('🧪 Testing SQS Queue...');
  console.log('Queue URL:', config.aws.sqsQueueUrl);

  try {
    // Send a test message
    const messageId = await AWSServices.sendToQueue({
      type: 'TEST',
      message: 'Hello from SQS!',
      timestamp: new Date().toISOString(),
    });

    console.log('✅ Message sent successfully!');
    console.log('Message ID:', messageId);

    // Receive the message
    const { sqs } = require('./config/aws');
    const receiveParams = {
      QueueUrl: config.aws.sqsQueueUrl!,
      MaxNumberOfMessages: 1,
      WaitTimeSeconds: 5,
    };

    console.log('\n📥 Receiving message...');
    const data = await sqs.receiveMessage(receiveParams).promise();

    if (data.Messages && data.Messages.length > 0) {
      console.log('✅ Message received:');
      console.log(JSON.parse(data.Messages[0].Body));

      // Delete the message
      await sqs.deleteMessage({
        QueueUrl: config.aws.sqsQueueUrl!,
        ReceiptHandle: data.Messages[0].ReceiptHandle!,
      }).promise();

      console.log('✅ Message deleted from queue');
    } else {
      console.log('⚠️  No messages in queue');
    }

  } catch (error) {
    console.error('❌ SQS test failed:', error);
  }
}

testSQS();