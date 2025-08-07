# InFoundr Email Service

A Node.js/Express email service for InFoundr that integrates with SendGrid to send automated emails for startup invites and welcome messages.

## Features

- 🚀 **Startup Invite Emails**: Send beautiful HTML emails when accelerators invite startups
- 👋 **Welcome Emails**: Send welcome emails to new users
- 📧 **Bulk Email Support**: Send emails to multiple recipients
- 🛡️ **Security**: Rate limiting, CORS protection, and input validation
- 📊 **Health Monitoring**: Health check endpoints for monitoring
- 🎨 **Beautiful Templates**: Responsive HTML email templates
- 🔧 **Easy Deployment**: Ready for Contabo server deployment

## Quick Start

### Prerequisites

- Node.js 16+ 
- SendGrid account and API key
- PM2 (for production deployment)

### Local Development

1. **Clone and install dependencies:**
   ```bash
   cd email-service
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your SendGrid API key and other settings
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Test the service:**
   ```bash
   curl http://localhost:3001/health
   ```

### Production Deployment (Contabo)

1. **Upload files to your server:**
   ```bash
   scp -r email-service/ user@your-server:/path/to/deploy/
   ```

2. **SSH into your server and run:**
   ```bash
   cd /path/to/deploy/email-service
   chmod +x deploy.sh
   ./deploy.sh
   ```

## API Endpoints

### Health Check
```http
GET /health
```
Returns service status and timestamp.

### Send Startup Invite
```http
POST /send-startup-invite
Content-Type: application/json

{
  "email": "startup@example.com",
  "startupName": "TechStartup Inc",
  "programName": "Spring 2024 Accelerator",
  "inviteCode": "ABC123",
  "inviteLink": "https://infoundr.com/accelerator/invite/ABC123",
  "expiryDate": "2024-04-15"
}
```

### Send Welcome Email
```http
POST /send-welcome-email
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe"
}
```

### Bulk Send Emails
```http
POST /bulk-send
Content-Type: application/json

{
  "emails": [
    {
      "email": "user1@example.com",
      "name": "User One",
      "startupName": "Startup One",
      "programName": "Program One",
      "inviteCode": "CODE1"
    }
  ]
}
```

### Test Email
```http
GET /test?email=test@example.com
```
Sends a test email to verify the service is working.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SENDGRID_API_KEY` | Your SendGrid API key | Required |
| `FROM_EMAIL` | Sender email address | noreply@infoundr.com |
| `FROM_NAME` | Sender name | InFoundr Team |
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment | development |
| `ALLOWED_ORIGINS` | CORS allowed origins | http://localhost:3000 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

## Email Templates

### Startup Invite Template
- Beautiful gradient header
- Program details and benefits
- Invite code and direct link
- Expiry date information
- Responsive design

### Welcome Email Template
- Welcome message
- Platform features overview
- Call-to-action button
- Support contact information

## Frontend Integration

The frontend can integrate with this service using the `emailService` from `src/services/email.ts`:

```typescript
import { emailService } from '../services/email';

// Send startup invite
const result = await emailService.sendStartupInvite({
  email: 'startup@example.com',
  startupName: 'TechStartup',
  programName: 'Spring Accelerator',
  inviteCode: 'ABC123'
});

// Send welcome email
const result = await emailService.sendWelcomeEmail({
  email: 'user@example.com',
  name: 'John Doe'
});
```

## Monitoring and Logs

### PM2 Commands
```bash
# View logs
pm2 logs infoundr-email

# Monitor processes
pm2 monit

# Restart service
pm2 restart infoundr-email

# Stop service
pm2 stop infoundr-email
```

### Health Monitoring
The service provides a health endpoint that can be used with monitoring tools:
```bash
curl http://your-domain.com/health
```

## Security Features

- **Rate Limiting**: Prevents abuse with configurable limits
- **CORS Protection**: Configurable allowed origins
- **Input Validation**: Validates all email data
- **Helmet**: Security headers
- **Error Handling**: Graceful error responses

## Troubleshooting

### Common Issues

1. **SendGrid API Key Error**
   - Verify your API key is correct
   - Check SendGrid account status
   - Ensure sender email is verified

2. **CORS Errors**
   - Update `ALLOWED_ORIGINS` in `.env`
   - Check frontend URL configuration

3. **Rate Limiting**
   - Increase limits in `.env` if needed
   - Check if you're hitting SendGrid limits

4. **Service Not Starting**
   - Check logs: `pm2 logs infoundr-email`
   - Verify port availability
   - Check environment variables

### Debug Mode
Set `NODE_ENV=development` for detailed error messages.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details. 