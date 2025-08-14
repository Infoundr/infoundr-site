const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5005;

// Middleware
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// API Key Authentication Middleware
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'API key is required',
      message: 'Please provide an API key in the X-API-Key header or Authorization header'
    });
  }
  
  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({
      error: 'Invalid API key',
      message: 'The provided API key is not valid'
    });
  }
  
  next();
};

// Apply API key authentication to all routes except health check
app.use((req, res, next) => {
  if (req.path === '/health') {
    return next(); // Skip authentication for health check
  }
  authenticateApiKey(req, res, next);
});

// SendGrid setup
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Email templates
const emailTemplates = {
  startupInvite: {
    subject: (startupName, programName) => `You're invited to join ${programName} on InFoundr`,
    html: (data) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>InFoundr Invitation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .highlight { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 Welcome to InFoundr!</h1>
            <p>You've been invited to join our accelerator program</p>
          </div>
          <div class="content">
            <h2>Hello ${data.startupName}!</h2>
            <p>You've been invited to join <strong>${data.programName}</strong> on InFoundr, the premier platform for startup acceleration and growth.</p>
            
            <div class="highlight">
              <h3>🎯 What's included in your invitation:</h3>
              <ul>
                <li>Access to exclusive accelerator resources</li>
                <li>Direct mentorship and guidance</li>
                <li>Networking opportunities with other startups</li>
                <li>Tools and analytics to track your progress</li>
              </ul>
            </div>

            <p><strong>Your invite code:</strong> <code style="background: #f8f9fa; padding: 5px 10px; border-radius: 3px; font-family: monospace;">${data.inviteCode}</code></p>
            
            <p><strong>Or use this direct link:</strong></p>
            <a href="${data.inviteLink}" class="button">Join ${data.programName}</a>
            
            <p><strong>Important:</strong> This invitation expires on ${data.expiryDate}. Please accept it before then to secure your spot.</p>
            
            <p>If you have any questions, feel free to reach out to our support team.</p>
          </div>
          <div class="footer">
            <p>© 2024 InFoundr. All rights reserved.</p>
            <p>This email was sent to ${data.email}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: (data) => `
      Welcome to InFoundr!
      
      Hello ${data.startupName}!
      
      You've been invited to join ${data.programName} on InFoundr, the premier platform for startup acceleration and growth.
      
      Your invite code: ${data.inviteCode}
      Direct link: ${data.inviteLink}
      
      This invitation expires on ${data.expiryDate}. Please accept it before then to secure your spot.
      
      If you have any questions, feel free to reach out to our support team.
      
      © 2024 InFoundr. All rights reserved.
    `
  },
  teamInvite: {
    subject: (memberName, acceleratorName) => `You're invited to join ${acceleratorName} team on InFoundr`,
    html: (data) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>InFoundr Team Invitation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .highlight { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>👥 Team Invitation</h1>
            <p>You've been invited to join our accelerator team</p>
          </div>
          <div class="content">
            <h2>Hello ${data.startupName}!</h2>
            <p>You've been invited to join the <strong>${data.programName}</strong> team on InFoundr as a team member.</p>
            
            <div class="highlight">
              <h3>🎯 What you'll be able to do:</h3>
              <ul>
                <li>Access accelerator dashboard and tools</li>
                <li>Manage startup applications and progress</li>
                <li>Collaborate with other team members</li>
                <li>View analytics and reports</li>
              </ul>
            </div>

            <p><strong>Your invite code:</strong> <code style="background: #f8f9fa; padding: 5px 10px; border-radius: 3px; font-family: monospace;">${data.inviteCode}</code></p>
            
            <p><strong>Or use this direct link:</strong></p>
            <a href="${data.inviteLink}" class="button">Join ${data.programName} Team</a>
            
            <p><strong>Important:</strong> This invitation expires on ${data.expiryDate}. Please accept it before then to secure your spot.</p>
            
            <p>If you have any questions, feel free to reach out to the team.</p>
          </div>
          <div class="footer">
            <p>© 2024 InFoundr. All rights reserved.</p>
            <p>This email was sent to ${data.email}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: (data) => `
      Team Invitation - InFoundr
      
      Hello ${data.startupName}!
      
      You've been invited to join the ${data.programName} team on InFoundr as a team member.
      
      What you'll be able to do:
      - Access accelerator dashboard and tools
      - Manage startup applications and progress
      - Collaborate with other team members
      - View analytics and reports
      
      Your invite code: ${data.inviteCode}
      Direct link: ${data.inviteLink}
      
      This invitation expires on ${data.expiryDate}. Please accept it before then to secure your spot.
      
      If you have any questions, feel free to reach out to the team.
      
            © 2024 InFoundr. All rights reserved.
    `
  },
  welcomeEmail: {
    subject: (name) => `Welcome to InFoundr, ${name}!`,
    html: (data) => `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to InFoundr</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to InFoundr!</h1>
            <p>Your startup journey begins here</p>
          </div>
          <div class="content">
            <h2>Hello ${data.name}!</h2>
            <p>Welcome to InFoundr! We're excited to have you join our community of innovative startups and accelerators.</p>
            
            <p>Here's what you can do on InFoundr:</p>
            <ul>
              <li>Connect with accelerators and mentors</li>
              <li>Track your startup's progress with analytics</li>
              <li>Access exclusive resources and tools</li>
              <li>Network with other founders</li>
            </ul>
            
            <a href="https://infoundr.com/dashboard" class="button">Get Started</a>
            
            <p>If you have any questions, our support team is here to help!</p>
          </div>
          <div class="footer">
            <p>© 2024 InFoundr. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: (data) => `
      Welcome to InFoundr!
      
      Hello ${data.name}!
      
      Welcome to InFoundr! We're excited to have you join our community of innovative startups and accelerators.
      
      Here's what you can do on InFoundr:
      - Connect with accelerators and mentors
      - Track your startup's progress with analytics
      - Access exclusive resources and tools
      - Network with other founders
      
      Get started: https://infoundr.com/dashboard
      
      If you have any questions, our support team is here to help!
      
      © 2024 InFoundr. All rights reserved.
    `
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'infoundr-email-service'
  });
});

// Send team invite email
app.post('/send-team-invite', async (req, res) => {
  try {
    const { 
      email, 
      startupName, 
      programName, 
      inviteCode, 
      inviteLink, 
      expiryDate 
    } = req.body;

    // Validation
    if (!email || !startupName || !programName || !inviteCode) {
      return res.status(400).json({ 
        error: 'Missing required fields: email, startupName, programName, inviteCode' 
      });
    }

    const template = emailTemplates.teamInvite;
    const data = {
      startupName,
      programName,
      inviteCode,
      inviteLink: inviteLink || `https://infoundr.com/accelerator/roles/invite/${inviteCode}`,
      expiryDate: expiryDate || '7 days from now',
      email
    };

    const msg = {
      to: email,
      from: {
        email: process.env.FROM_EMAIL || 'noreply@infoundr.com',
        name: process.env.FROM_NAME || 'InFoundr Team'
      },
      subject: template.subject(startupName, programName),
      text: template.text(data),
      html: template.html(data)
    };

    await sgMail.send(msg);
    
    console.log(`Team invite email sent successfully to ${email}`);
    res.json({ 
      success: true, 
      message: 'Team invite email sent successfully',
      recipient: email
    });

  } catch (error) {
    console.error('Error sending team invite email:', error);
    res.status(500).json({ 
      error: 'Failed to send email',
      details: error.message 
    });
  }
});

// Send startup invite email
app.post('/send-startup-invite', async (req, res) => {
  try {
    const { 
      email, 
      startupName, 
      programName, 
      inviteCode, 
      inviteLink, 
      expiryDate 
    } = req.body;

    // Validation
    if (!email || !startupName || !programName || !inviteCode) {
      return res.status(400).json({ 
        error: 'Missing required fields: email, startupName, programName, inviteCode' 
      });
    }

    const template = emailTemplates.startupInvite;
    const data = {
      startupName,
      programName,
      inviteCode,
      inviteLink: inviteLink || `https://infoundr.com/accelerator/invite/${inviteCode}`,
      expiryDate: expiryDate || '30 days from now',
      email
    };

    const msg = {
      to: email,
      from: {
        email: process.env.FROM_EMAIL || 'noreply@infoundr.com',
        name: process.env.FROM_NAME || 'InFoundr Team'
      },
      subject: template.subject(startupName, programName),
      text: template.text(data),
      html: template.html(data)
    };

    await sgMail.send(msg);
    
    console.log(`Startup invite email sent successfully to ${email}`);
    res.json({ 
      success: true, 
      message: 'Startup invite email sent successfully',
      recipient: email
    });

  } catch (error) {
    console.error('Error sending startup invite email:', error);
    res.status(500).json({ 
      error: 'Failed to send email',
      details: error.message 
    });
  }
});

// Send welcome email
app.post('/send-welcome-email', async (req, res) => {
  try {
    const { email, name } = req.body;

    // Validation
    if (!email || !name) {
      return res.status(400).json({ 
        error: 'Missing required fields: email, name' 
      });
    }

    const template = emailTemplates.welcomeEmail;
    const data = { name, email };

    const msg = {
      to: email,
      from: {
        email: process.env.FROM_EMAIL || 'noreply@infoundr.com',
        name: process.env.FROM_NAME || 'InFoundr Team'
      },
      subject: template.subject(name),
      text: template.text(data),
      html: template.html(data)
    };

    await sgMail.send(msg);
    
    console.log(`Welcome email sent successfully to ${email}`);
    res.json({ 
      success: true, 
      message: 'Welcome email sent successfully',
      recipient: email
    });

  } catch (error) {
    console.error('Error sending welcome email:', error);
    res.status(500).json({ 
      error: 'Failed to send email',
      details: error.message 
    });
  }
});

// Bulk send emails
app.post('/bulk-send', async (req, res) => {
  try {
    const { emails } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ 
        error: 'Missing or invalid emails array' 
      });
    }

    const results = [];
    const batchSize = 10; // SendGrid allows up to 1000 recipients per request

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      
      const personalizations = batch.map(emailData => ({
        to: [{ email: emailData.email }],
        substitutions: {
          name: emailData.name || 'there',
          startupName: emailData.startupName || '',
          programName: emailData.programName || '',
          inviteCode: emailData.inviteCode || '',
          inviteLink: emailData.inviteLink || '',
          expiryDate: emailData.expiryDate || '30 days from now'
        }
      }));

      const msg = {
        personalizations,
        from: {
          email: process.env.FROM_EMAIL || 'noreply@infoundr.com',
          name: process.env.FROM_NAME || 'InFoundr Team'
        },
        subject: 'You\'re invited to join InFoundr',
        templateId: 'd-your-sendgrid-template-id' // You can create a template in SendGrid
      };

      try {
        await sgMail.send(msg);
        batch.forEach(emailData => {
          results.push({
            email: emailData.email,
            success: true,
            message: 'Email sent successfully'
          });
        });
      } catch (batchError) {
        batch.forEach(emailData => {
          results.push({
            email: emailData.email,
            success: false,
            error: batchError.message
          });
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    res.json({
      success: true,
      message: `Bulk email operation completed. ${successCount} successful, ${failureCount} failed.`,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount
      }
    });

  } catch (error) {
    console.error('Error in bulk send:', error);
    res.status(500).json({ 
      error: 'Failed to process bulk email request',
      details: error.message 
    });
  }
});

// Test endpoint
app.get('/test', async (req, res) => {
  try {
    const testEmail = req.query.email || 'test@example.com';
    
    const msg = {
      to: testEmail,
      from: {
        email: process.env.FROM_EMAIL || 'noreply@infoundr.com',
        name: process.env.FROM_NAME || 'InFoundr Team'
      },
      subject: 'InFoundr Email Service Test',
      text: 'This is a test email from the InFoundr email service.',
      html: '<h1>InFoundr Email Service Test</h1><p>This is a test email from the InFoundr email service.</p>'
    };

    await sgMail.send(msg);
    res.json({ 
      success: true, 
      message: 'Test email sent successfully',
      recipient: testEmail
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      error: 'Failed to send test email',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'POST /send-startup-invite',
      'POST /send-team-invite',
      'POST /send-welcome-email',
      'POST /bulk-send',
      'GET /test'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 InFoundr Email Service running on port ${PORT}`);
  console.log(`📧 SendGrid API Key configured: ${process.env.SENDGRID_API_KEY ? 'Yes' : 'No'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
}); 