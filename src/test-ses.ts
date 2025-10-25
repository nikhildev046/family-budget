import { AWSServices } from './config/aws';
import { config } from './config/env';

async function testSES() {
  console.log('🧪 Testing SES Email...');
  console.log('From:', config.aws.sesFromEmail);

  try {
    const messageId = await AWSServices.sendEmail(
      config.aws.sesFromEmail!, // Send to yourself for testing
      'Test Email from Family Budget App',
      '<h1>Hello!</h1><p>This is a test email from your Family Budget SaaS app.</p>',
      'Hello! This is a test email from your Family Budget SaaS app.'
    );

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', messageId);
    console.log('📧 Check your inbox:', config.aws.sesFromEmail);

  } catch (error: any) {
    console.error('❌ SES test failed:', error.message);
    
    if (error.code === 'MessageRejected') {
      console.error('\n⚠️  Email not verified! Run:');
      console.error(`aws ses verify-email-identity --email-address ${config.aws.sesFromEmail}`);
    }
  }
}

testSES();