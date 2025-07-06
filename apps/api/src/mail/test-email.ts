#!/usr/bin/env ts-node

import { NestFactory } from '@nestjs/core';
import { MailService } from './mail.service';
import { MailModule } from './mail.module';

/**
 * Quick script to test email configuration
 * Usage: npx ts-node src/mail/test-email.ts
 */
async function testEmail() {
  try {
    console.log('🧪 Testing email configuration...\n');
    
    // Create a minimal NestJS app with just the mail module
    const app = await NestFactory.createApplicationContext(MailModule);
    const mailService = app.get(MailService);

    // Test email data
    const testEmail = process.argv[2] || 'test@example.com';
    const testName = 'Test User';
    
    console.log(`📧 Sending test email to: ${testEmail}`);
    console.log(`📤 Using SMTP: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
    console.log(`👤 From: ${process.env.SMTP_FROM}\n`);

    // Send a welcome email as test
    await mailService.sendWelcomeEmail(testEmail, testName);
    
    console.log('✅ Email sent successfully!');
    console.log('📋 Check the recipient inbox and your email provider dashboard.');
    
    await app.close();
    
  } catch (error) {
    console.error('❌ Email test failed:');
    console.error(error.message);
    
    // Provide troubleshooting tips
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check your SMTP credentials in .env file');
    console.log('2. Verify SMTP_HOST and SMTP_PORT are correct');
    console.log('3. For Gmail: Use app password, not regular password');
    console.log('4. For SendGrid: Ensure API key starts with "SG." and SMTP_USER is "apikey"');
    console.log('5. Check firewall/network settings');
    
    process.exit(1);
  }
}

// Handle environment loading
if (!process.env.SMTP_HOST) {
  console.log('⚠️  Loading environment variables...');
  require('dotenv').config();
  
  if (!process.env.SMTP_HOST) {
    console.error('❌ SMTP_HOST not found in environment variables');
    console.log('Please configure your .env file with SMTP settings');
    process.exit(1);
  }
}

testEmail();