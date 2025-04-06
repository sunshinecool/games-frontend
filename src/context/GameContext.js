import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';

const GameContext = createContext();

// Get the backend URL from environment variables or use default
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [playerState, setPlayerState] = useState(null);
  const [gameMessage, setGameMessage] = useState('');
  const [error, setError] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    if (!socket && !isConnecting) {
      setIsConnecting(true);
      console.log('Connecting to backend at:', BACKEND_URL);
      
      const newSocket = io(BACKEND_URL, {
        withCredentials: true,
        transports: ['websocket'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      const handleConnect = () => {
        console.log('Connected to game server with ID:', newSocket.id);
        setSocket(newSocket);
        setIsConnecting(false);
        setError(null);
      };

      const handleDisconnect = () => {
        console.log('Disconnected from game server');
        setSocket(null);
        setPlayerState(null);
        setGameState(null);
        setCurrentRoom(null);
        setError('Disconnected from server. Please refresh the page.');
        setIsConnecting(false);
      };

      const handleConnectError = (error) => {
        console.error('Connection error:', error);
        setSocket(null);
        setError('Failed to connect to server. Please check your connection.');
        setIsConnecting(false);
      };

      newSocket.on('connect', handleConnect);
      newSocket.on('disconnect', handleDisconnect);
      newSocket.on('connect_error', handleConnectError);

      return () => {
        console.log('Cleaning up socket connection');
        newSocket.removeListener('connect', handleConnect);
        newSocket.removeListener('disconnect', handleDisconnect);
        newSocket.removeListener('connect_error', handleConnectError);
        newSocket.disconnect();
      };
    }
  }, [socket, isConnecting]);

  // Handle game events
  useEffect(() => {
    if (!socket) return;

    const handleGameStateUpdate = ({ gameState }) => {
      console.log('Game state update:', gameState);
      setGameState(gameState);
      setGameMessage(gameState.message || '');
    };

    const handlePlayerJoined = ({ player, gameState }) => {
      console.log('Player joined:', player);
      if (player.id === socket.id) {
        setPlayerState(player);
        setCurrentRoom(gameState.id);
        setError(null);
      }
      setGameState(gameState);
    };

    const handleJoinError = (error) => {
      console.error('Join error:', error);
      setError(typeof error === 'string' ? error : error.message);
      setPlayerState(null);
      setCurrentRoom(null);
    };

    socket.on('gameStateUpdate', handleGameStateUpdate);
    socket.on('playerJoined', handlePlayerJoined);
    socket.on('joinError', handleJoinError);
    socket.on('error', handleJoinError);

    return () => {
      socket.off('gameStateUpdate', handleGameStateUpdate);
      socket.off('playerJoined', handlePlayerJoined);
      socket.off('joinError', handleJoinError);
      socket.off('error', handleJoinError);
    };
  }, [socket]);

  const joinGame = useCallback((playerName, roomId) => {
    if (!socket) {
      setError('Not connected to server. Please refresh the page.');
      return;
    }

    if (currentRoom) {
      socket.emit('leaveGame', { roomId: currentRoom });
    }

    console.log('Joining game with name:', playerName, 'in room:', roomId);
    socket.emit('joinGame', { playerName, roomId });
  }, [socket, currentRoom]);

  const readyToPlay = useCallback(() => {
    if (socket && gameState) {
      socket.emit('playerReady', { roomId: gameState.id });
    }
  }, [socket, gameState]);

  const placeBet = useCallback((amount) => {
    if (socket && gameState) {
      socket.emit('placeBet', { amount, roomId: gameState.id });
    }
  }, [socket, gameState]);

  const hit = useCallback(() => {
    if (socket && gameState) {
      socket.emit('hit', { roomId: gameState.id });
    }
  }, [socket, gameState]);

  const stand = useCallback(() => {
    if (socket && gameState) {
      socket.emit('stand', { roomId: gameState.id });
    }
  }, [socket, gameState]);

  const doubleDown = useCallback(() => {
    if (socket && gameState && gameState.gamePhase === 'playing') {
      socket.emit('doubleDown', { roomId: gameState.id });
    }
  }, [socket, gameState]);

  const nextGame = useCallback(() => {
    if (socket && gameState && gameState.gamePhase === 'gameOver') {
      console.log('Starting next game');
      socket.emit('nextGame', { roomId: 'room1' });
    }
  }, [socket, gameState]);

  const leaveGame = useCallback(() => {
    if (socket && currentRoom) {
      socket.emit('leaveGame', { roomId: currentRoom });
      setPlayerState(null);
      setGameState(null);
      setCurrentRoom(null);
    }
  }, [socket, currentRoom]);

  const value = {
    socket,
    gameState,
    playerState,
    gameMessage,
    error,
    currentRoom,
    isConnecting,
    joinGame,
    leaveGame,
    placeBet,
    readyToPlay,
    hit,
    stand,
    doubleDown,
    nextGame
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export default GameContext; 