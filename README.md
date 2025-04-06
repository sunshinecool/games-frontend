# Games Frontend

This is the frontend application for the multiplayer games platform. It provides a modern, responsive user interface for playing various games in real-time with other players.

## Features

- Real-time game updates using Socket.IO
- Modern, responsive UI
- Multiple game support (currently featuring Blackjack)
- Player interaction and game controls
- Game room management
- Real-time chat functionality

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
REACT_APP_BACKEND_URL=http://localhost:3001
```

3. Start the development server:
```bash
npm start
```

The application will start on `http://localhost:3000` by default.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

## Project Structure

```
src/
  ├── components/         # React components
  │   ├── games/         # Game-specific components
  │   └── layout/        # Layout components
  ├── context/           # React context providers
  ├── styles/            # CSS styles
  └── utils/             # Utility functions
```

## Game Components

### Blackjack
- `BlackjackGame.js` - Main game component
- `BlackjackLayout.js` - Game layout
- `Card.js` - Playing card component
- `DealerHand.js` - Dealer's hand component
- `PlayerHand.js` - Player's hand component
- `GameControls.js` - Game control buttons
- `GameMessage.js` - Game status messages
- `JoinGameForm.js` - Game join form

## Development

The application uses Create React App and supports hot reloading during development.

## Production

For production deployment:
```bash
npm run build
```

This will create an optimized production build in the `build` folder. 