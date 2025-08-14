#!/usr/bin/env node

/**
 * Test script for InFoundr Email Service
 * Usage: node test-email.js [email]
 */

const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL || 'http://localhost:5005';
const testEmail = process.argv[2] || 'test@example.com';

async function testEmailService() {
  console.log('🧪 Testing InFoundr Email Service...\n');

  try {
    // Test health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${EMAIL_SERVICE_URL}/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check passed:', healthData);
    } else {
      throw new Error(`Health check failed: ${healthResponse.status}`);
    }

    // Test startup invite email
    console.log('\n2. Testing startup invite email...');
    const inviteData = {
      email: testEmail,
      startupName: 'Test Startup Inc',
      programName: 'Test Accelerator Program',
      inviteCode: 'TEST123',
      inviteLink: 'https://infoundr.com/accelerator/invite/TEST123',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
    };

    const inviteResponse = await fetch(`${EMAIL_SERVICE_URL}/send-startup-invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inviteData),
    });

    if (inviteResponse.ok) {
      const inviteResult = await inviteResponse.json();
      console.log('✅ Startup invite email sent successfully:', inviteResult);
    } else {
      const errorData = await inviteResponse.json();
      console.log('❌ Startup invite email failed:', errorData);
    }

    // Test welcome email
    console.log('\n3. Testing welcome email...');
    const welcomeData = {
      email: testEmail,
      name: 'Test User'
    };

    const welcomeResponse = await fetch(`${EMAIL_SERVICE_URL}/send-welcome-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(welcomeData),
    });

    if (welcomeResponse.ok) {
      const welcomeResult = await welcomeResponse.json();
      console.log('✅ Welcome email sent successfully:', welcomeResult);
    } else {
      const errorData = await welcomeResponse.json();
      console.log('❌ Welcome email failed:', errorData);
    }

    // Test bulk email
    console.log('\n4. Testing bulk email...');
    const bulkData = {
      emails: [
        {
          email: testEmail,
          name: 'Test User 1',
          startupName: 'Test Startup 1',
          programName: 'Test Program 1',
          inviteCode: 'BULK1'
        },
        {
          email: testEmail,
          name: 'Test User 2',
          startupName: 'Test Startup 2',
          programName: 'Test Program 2',
          inviteCode: 'BULK2'
        }
      ]
    };

    const bulkResponse = await fetch(`${EMAIL_SERVICE_URL}/bulk-send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bulkData),
    });

    if (bulkResponse.ok) {
      const bulkResult = await bulkResponse.json();
      console.log('✅ Bulk email sent successfully:', bulkResult.summary);
    } else {
      const errorData = await bulkResponse.json();
      console.log('❌ Bulk email failed:', errorData);
    }

    console.log('\n🎉 All tests completed!');
    console.log(`📧 Test emails sent to: ${testEmail}`);
    console.log('📋 Check your email inbox for the test messages.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Make sure the email service is running on:', EMAIL_SERVICE_URL);
    process.exit(1);
  }
}

// Run the test
testEmailService(); 