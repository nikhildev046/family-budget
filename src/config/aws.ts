import AWS from 'aws-sdk';
import { config } from './env';

// ==========================================
// CONFIGURE AWS SDK
// ==========================================

AWS.config.update({
  region: config.aws.region,
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
});

// ==========================================
// CREATE SERVICE INSTANCES
// ==========================================

export const s3 = new AWS.S3();
export const sqs = new AWS.SQS();
export const ses = new AWS.SES({ region: config.aws.sesRegion });

// ==========================================
// TYPE-SAFE AWS SERVICE WRAPPERS
// ==========================================

export class AWSServices {
  // S3 Operations
  static async uploadToS3(
    buffer: Buffer,
    key: string,
    contentType: string
  ): Promise<string> {
    const params: AWS.S3.PutObjectRequest = {
      Bucket: config.aws.s3BucketName!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'private',
    };

    const result = await s3.upload(params).promise();
    return result.Location;
  }

  static async deleteFromS3(key: string): Promise<void> {
    const params: AWS.S3.DeleteObjectRequest = {
      Bucket: config.aws.s3BucketName!,
      Key: key,
    };

    await s3.deleteObject(params).promise();
  }

  static async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const params: AWS.S3.GetObjectRequest = {
      Bucket: config.aws.s3BucketName!,
      Key: key,
    };

    return s3.getSignedUrlPromise('getObject', { ...params, Expires: expiresIn });
  }

  // SQS Operations
  static async sendToQueue(messageBody: any, messageGroupId?: string): Promise<string> {
    if (!config.aws.sqsQueueUrl) {
      throw new Error('SQS Queue URL not configured');
    }

    const params: AWS.SQS.SendMessageRequest = {
      QueueUrl: config.aws.sqsQueueUrl,
      MessageBody: JSON.stringify(messageBody),
      ...(messageGroupId && { MessageGroupId: messageGroupId }),
    };

    const result = await sqs.sendMessage(params).promise();
    return result.MessageId!;
  }

  // SES Operations
  static async sendEmail(
    to: string,
    subject: string,
    htmlBody: string,
    textBody: string
  ): Promise<string> {
    if (!config.aws.sesFromEmail) {
      throw new Error('SES From Email not configured');
    }

    const params: AWS.SES.SendEmailRequest = {
      Source: config.aws.sesFromEmail,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: htmlBody,
            Charset: 'UTF-8',
          },
          Text: {
            Data: textBody,
            Charset: 'UTF-8',
          },
        },
      },
    };

    const result = await ses.sendEmail(params).promise();
    return result.MessageId;
  }
}

// ==========================================
// TEST AWS CONNECTIONS
// ==========================================

export const testAWSConnection = async (): Promise<void> => {
  try {
    // Test S3
    if (config.aws.s3BucketName) {
      await s3.listBuckets().promise();
      console.log('✅ AWS S3 connected');
    }

    // Test SQS
    if (config.aws.sqsQueueUrl) {
      await sqs.getQueueAttributes({
        QueueUrl: config.aws.sqsQueueUrl,
        AttributeNames: ['All'],
      }).promise();
      console.log('✅ AWS SQS connected');
    }

    // Test SES
    if (config.aws.sesFromEmail) {
      await ses.getAccountSendingEnabled().promise();
      console.log('✅ AWS SES connected');
    }

  } catch (err) {
    if (err instanceof Error) {
      console.error('❌ AWS connection error:', err.message);
    }
  }
};