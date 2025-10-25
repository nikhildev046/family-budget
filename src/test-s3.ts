import { AWSServices } from './config/aws';
import { config } from './config/env';

async function testS3() {
  console.log('🧪 Testing S3 File Upload...');
  console.log('Bucket:', config.aws.s3BucketName);

  try {
    // Create a test file
    const testContent = 'This is a test receipt file for Family Budget App!';
    const buffer = Buffer.from(testContent);
    const key = `test-receipts/test-${Date.now()}.txt`;

    // Upload to S3
    const url = await AWSServices.uploadToS3(buffer, key, 'text/plain');

    console.log('✅ File uploaded successfully!');
    console.log('S3 URL:', url);

    // Generate signed URL for viewing
    const signedUrl = await AWSServices.getSignedUrl(key, 3600);
    console.log('✅ Signed URL generated (valid for 1 hour):');
    console.log(signedUrl);

    // Cleanup: Delete test file
    await AWSServices.deleteFromS3(key);
    console.log('✅ Test file deleted');

  } catch (error: any) {
    console.error('❌ S3 test failed:', error.message);
  }
}

testS3();