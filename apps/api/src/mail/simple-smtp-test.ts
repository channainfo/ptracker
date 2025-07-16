#!/usr/bin/env ts-node

import * as nodemailer from 'nodemailer';

async function testSMTPConnection() {
  console.log('🧪 Testing SMTP connection directly...\n');

  // Force localhost settings
  const config = {
    host: '127.0.0.1',
    port: 1025,
    secure: false,
    auth: undefined,
    tls: {
      rejectUnauthorized: false,
    },
    ignoreTLS: true,
  };

  console.log('📧 SMTP Configuration:');
  console.log(JSON.stringify(config, null, 2));
  console.log('');

  try {
    // Create transporter
    const transporter = nodemailer.createTransport(config);

    // Test connection
    console.log('🔄 Testing connection...');
    await transporter.verify();
    console.log('✅ Connection successful!');

    // Send test email
    console.log('📨 Sending test email...');
    const info = await transporter.sendMail({
      from: '"PTracker Test" <test@ptracker.com>',
      to: 'test@example.com',
      subject: 'SMTP Connection Test',
      html: `
        <h2>SMTP Test Successful!</h2>
        <p>This email confirms that the SMTP connection is working properly.</p>
        <p>Sent at: ${new Date().toISOString()}</p>
      `,
    });

    console.log('✅ Email sent successfully!');
    console.log('📋 Message ID:', info.messageId);
    console.log('🌐 Check MailHog at: http://localhost:8025');

  } catch (error) {
    console.error('❌ SMTP test failed:');
    console.error(error.message);
    console.log('\n🔧 Make sure MailHog is running:');
    console.log('docker run -d -p 1025:1025 -p 8025:8025 --name mailhog mailhog/mailhog');
  }
}

testSMTPConnection();