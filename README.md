# Infoundr Site

## About Infoundr

Infoundr is an AI-powered platform designed to help early-stage startup founders automate various operational tasks such as: github automation, calendar management, email automation, contract review, financial reporting, investor updates, bookkeeping, tax compliance, hiring workflows, market research, and simulating business decisions to help founders make smarter choices. It integrates with popular tools like Slack, Discord, and OpenChat to deliver personalized guidance and automate routine tasks, making startup operations faster and more efficient.

With Infoundr, teams can:
- **AI-Powered Project Management**: Get intelligent recommendations and automated task management
- **Seamless Integration**: Connect with Discord and Slack for frictionless workflow integration
- **Startup Acceleration**: Access tools designed specifically for startup growth and accelerator programs
- **Decentralized Infrastructure**: Built on the Internet Computer for enhanced security and reliability

## Video Demos:

### 1. Pitch Demo Video
https://github.com/user-attachments/assets/158c45fc-a20e-4523-a687-f9df03e04ec2 

### 2. Using Infoundr on Discord
https://github.com/user-attachments/assets/463b18e9-50f6-4414-81ec-da815225dd24

### 3. Using Infoundr on Slack
_Coming soon_

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (v7 or higher)
- [DFX](https://internetcomputer.org/docs/current/developer-docs/build/install-upgrade-remove) (latest version)

--- 
- Backend canister available at [link](https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=g7ko2-fyaaa-aaaam-qdlea-cai)

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/infoundr/infoundr-site.git
cd infoundr-site
```

2. Start the local Internet Computer replica:
```bash
dfx start --clean --background
```

3. Run the setup script to install dependencies and deploy canisters:
```bash
npm run setup
```

4. Start the development server:
```bash
cd src/frontend
npm run dev
```

The application should now be running at `http://localhost:3000`

## Development Options

### Local Development with Mock Data
For frontend development without needing the backend canister:

```bash
npm run dev:local:frontend
```

For when you need both frontend and backend when working locally: 
```bash
npm run dev:local:all
```

This will:
1. Configure the environment for local development
2. Enable mock authentication
3. Use mock data instead of backend calls
4. Start the development server

### Deploying to Playground
To deploy to the Internet Computer Playground and start the development server:

```bash
npm run dev:playground
```

This will:
1. Deploy your project to the playground
2. Update the configuration with the new playground canister ID
3. Start the development server

### Deploying to Mainnet
To deploy to the Internet Computer mainnet:

```bash
npm run deploy:mainnet
```

This will:
1. Deploy your canisters to mainnet
2. Update the configuration with the mainnet canister ID
3. Set the environment to use mainnet mode
4. Configure authentication to use backend mode (no mock authentication)
5. Update the frontend configuration for production

Important: Before deploying to mainnet, ensure you:
1. Have sufficient cycles in your canister
2. Have tested thoroughly in playground
3. Have the correct authentication configuration
4. Have backed up your canister ID

## Project Structure

```
infoundr-site/
├── scripts/              # Setup and utility scripts
│   ├── setup.sh         # Main setup script
│   ├── setup-backend.sh # Backend setup
│   ├── setup-local.sh   # Local development setup
│   └── deploy-playground.sh # Playground deployment
├── src/
│   ├── backend/         # Rust backend canister
│   │   ├── src/        # Backend source code
│   │   └── Cargo.toml  # Rust dependencies
│   └── frontend/       # React frontend
│       ├── src/        # Frontend source code
│       │   ├── components/ # React components
│       │   ├── mocks/     # Mock data for development
│       │   ├── pages/     # Page components
│       │   └── services/  # API services
│       └── package.json # Frontend dependencies
├── dfx.json            # DFX configuration
└── package.json        # Root package.json
```

## Development

### Backend Development
The backend is written in Rust and uses the Internet Computer's Rust CDK. For detailed documentation about the backend architecture, including authentication flows, data models, and security considerations, please see [Backend Architecture Documentation](docs/backend-architecture.md).

Key components:
- `src/backend/src/lib.rs` - Main entry point
- `src/backend/src/services/` - Business logic
- `src/backend/src/models/` - Data models
- `src/backend/src/storage/` - Storage management

### Frontend Development
The frontend is built with React and TypeScript. Key directories:
- `src/frontend/src/components/` - React components
- `src/frontend/src/services/` - API services
- `src/frontend/src/pages/` - Page components
- `src/frontend/src/mocks/` - Mock data for development

## Available Scripts

- `npm run setup` - Install dependencies and deploy canisters
- `npm run dev:local` - Start development server with mock data
- `npm run dev:playground` - Deploy to playground and start development server
- `npm start` - Start the frontend development server
- `npm run build` - Build the project for production
- `dfx deploy` - Deploy the canisters to the local network

## Authentication

The application supports multiple authentication methods:
- Internet Identity
- NFID (Non-Fungible Identity)
- Mock Authentication (for local development)

## Authentication Flows

### Standard Authentication
1. User visits dashboard and chooses login method (II or NFID)
2. User authenticates with chosen provider
3. On success, user is redirected to dashboard

### Mock Authentication (Local Development)
1. User visits dashboard
2. Mock authentication is automatically used
3. User is immediately redirected to dashboard with mock data

### Bot Dashboard Access
1. User interacts with bot in OpenChat
2. First interaction creates basic OpenChat user record
3. User types `/dashboard` command
4. Bot generates secure access token
5. Bot sends dashboard link with token
6. User clicks link and is redirected to `/bot-login?token={token}`
7. Frontend validates token with backend
8. If token is valid but user hasn't completed registration:
   - Show registration form
   - Collect user details
   - Complete registration
9. After registration/validation, redirect to dashboard

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Environment Configuration

### Endpoints and Hosts
The application uses different endpoints based on the environment:

- **Local Development**: `http://localhost:8080`
- **Playground**: `https://icp0.io`
- **Mainnet**: `https://icp0.io`

### Environment Variables
The following environment variables are used:

```bash
# Local Development
VITE_DFX_NETWORK=local
VITE_IC_HOST=http://localhost:8080
VITE_CANISTER_ID=<local-canister-id>
VITE_AUTH_MODE=mock
VITE_ENV_MODE=local

# Playground
VITE_DFX_NETWORK=playground
VITE_IC_HOST=https://icp0.io
VITE_CANISTER_ID=<playground-canister-id>
VITE_AUTH_MODE=backend
VITE_ENV_MODE=playground

# Mainnet
VITE_DFX_NETWORK=ic
VITE_IC_HOST=https://icp0.io
VITE_CANISTER_ID=<mainnet-canister-id>
VITE_AUTH_MODE=backend
VITE_ENV_MODE=mainnet
```

### Development Mode
The application uses a `DEV_MODE` flag in `src/frontend/src/mocks/mockData.ts` to control whether to use mock data:
- `true`: Use mock data and authentication (local development)
- `false`: Use real backend calls (playground and mainnet)

The deployment scripts automatically manage this flag:
- `setup-local.sh`: Sets `DEV_MODE=true`
- `deploy-playground.sh`: Sets `DEV_MODE=false`
- `deploy-mainnet.sh`: Sets `DEV_MODE=false`
