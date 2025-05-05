# Infoundr Site

A decentralized AI chat platform built on the Internet Computer.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) (v7 or higher)
- [DFX](https://internetcomputer.org/docs/current/developer-docs/build/install-upgrade-remove) (latest version)

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

### Deploying to Playground

To deploy to the Internet Computer Playground and start the development server:

```bash
npm run dev:playground
```

This will:
1. Deploy your project to the playground
2. Update the configuration with the new playground canister ID
3. Start the development server

## Project Structure

```
infoundr-site/
├── scripts/              # Setup and utility scripts
├── src/
│   ├── backend/         # Rust backend canister
│   │   ├── src/        # Backend source code
│   │   └── Cargo.toml  # Rust dependencies
│   └── frontend/       # React frontend
│       ├── src/        # Frontend source code
│       └── package.json # Frontend dependencies
├── dfx.json            # DFX configuration
└── package.json        # Root package.json
```

## Development

### Backend Development
The backend is written in Rust and uses the Internet Computer's Rust CDK. The main components are:
- `src/backend/src/lib.rs` - Main entry point
- `src/backend/src/services/` - Business logic
- `src/backend/src/models/` - Data models
- `src/backend/src/storage/` - Storage management

### Frontend Development
The frontend is built with React and TypeScript. Key directories:
- `src/frontend/src/components/` - React components
- `src/frontend/src/services/` - API services
- `src/frontend/src/pages/` - Page components

## Available Scripts

- `npm run setup` - Install dependencies and deploy canisters
- `npm start` - Start the frontend development server
- `npm run build` - Build the project for production
- `dfx deploy` - Deploy the canisters to the local network

## Authentication

The application supports two authentication methods:
- Internet Identity
- NFID (Non-Fungible Identity)

## Authentication Flows

### Standard Authentication
1. User visits dashboard and chooses login method (II or NFID)
2. User authenticates with chosen provider
3. On success, user is redirected to dashboard

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

Technical Flow:

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.


