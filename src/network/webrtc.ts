/**
 * WebRTC Peer-to-Peer & Broadcast Networking Engine for SBXXXX Rooms
 * Game: Chhaki Suna (ଛକି ଶୂନ)
 */

import Peer, { DataConnection } from 'peerjs';
import {
  BoardState,
  GameStatus,
  WinInfo,
  MoveRecord,
  RoundRecord,
  createEmptyBoard,
  applyMove,
} from '../game/rules';
import { liveMatchRegistry, INACTIVITY_TIMEOUT_MS } from './liveLobby';

export type UserRole = 'host' | 'guest' | 'spectator';

export interface PlayerInfo {
  name: string;
  role: UserRole;
  mark: 'X' | 'O' | null;
  id: string;
}

export interface GameState {
  board: BoardState;
  currentTurn: 'X' | 'O';
  status: GameStatus;
  winInfo: WinInfo | null;
  round: number;
  scores: {
    X: number;
    O: number;
    ties: number;
  };
  players: {
    X: PlayerInfo | null;
    O: PlayerInfo | null;
  };
  spectators: Array<{ id: string; name: string }>;
  rematchRequestedBy: 'X' | 'O' | null;
  matchStartTime: number;
  roundStartTime: number;
  currentRoundMoves: MoveRecord[];
  roundHistory: RoundRecord[];
  isPublicLive?: boolean;
}

export type NetworkMessage =
  | { type: 'STATE_SYNC'; payload: GameState }
  | { type: 'JOIN_REQUEST'; role: 'player' | 'guest' | 'spectator'; name: string; peerId: string }
  | { type: 'JOIN_ACCEPTED'; role: UserRole; mark: 'X' | 'O' | null; state: GameState; targetPeerId?: string }
  | { type: 'MOVE'; index: number; player: 'X' | 'O'; round: number }
  | { type: 'REMATCH_REQ'; player: 'X' | 'O'; round: number }
  | { type: 'REMATCH_ACCEPT'; round: number }
  | { type: 'REACTION'; emoji: string; sender: string }
  | { type: 'PLAYER_LEAVE'; peerId: string }
  | { type: 'PING' };

export interface NetworkCallbacks {
  onStateChange: (state: GameState) => void;
  onRoleChange?: (role: UserRole) => void;
  onConnectionStatusChange: (status: 'connected' | 'connecting' | 'disconnected', error?: string) => void;
  onReactionReceived: (emoji: string, sender: string) => void;
  onNotification?: (message: string) => void;
}

export class WebRTCNetworkRoom {
  public roomCode: string;
  public myRole: UserRole;
  public myName: string;
  public myId: string;
  public isPublicLive: boolean;

  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private broadcastChannel: BroadcastChannel | null = null;
  private callbacks: NetworkCallbacks;
  private state: GameState;
  private isDestroyed: boolean = false;
  private hostConnection: DataConnection | null = null;
  private joinAccepted: boolean = false;
  private joinRetryInterval: ReturnType<typeof setInterval> | null = null;
  private liveAnnounceInterval: ReturnType<typeof setInterval> | null = null;
  private lastActivityAt: number = Date.now();
  private handlePageUnload: () => void;

  constructor(
    roomCode: string,
    role: UserRole,
    name: string,
    callbacks: NetworkCallbacks,
    isPublicLive: boolean = true
  ) {
    this.roomCode = roomCode.toUpperCase();
    this.myRole = role;
    this.myName = name || (role === 'host' ? 'Player X' : role === 'guest' ? 'Player O' : 'Spectator');
    this.callbacks = callbacks;
    this.isPublicLive = isPublicLive;
    this.myId = `sb-${this.roomCode.toLowerCase()}-${this.myRole}-${Math.random().toString(36).substring(2, 7)}`;

    const now = Date.now();
    this.lastActivityAt = now;
    this.state = {
      board: createEmptyBoard(),
      currentTurn: 'X',
      status: 'playing',
      winInfo: null,
      round: 1,
      scores: { X: 0, O: 0, ties: 0 },
      players: {
        X: role === 'host' ? { name: this.myName, role: 'host', mark: 'X', id: this.myId } : null,
        O: role === 'guest' ? { name: this.myName, role: 'guest', mark: 'O', id: this.myId } : null,
      },
      spectators: role === 'spectator' ? [{ id: this.myId, name: this.myName }] : [],
      rematchRequestedBy: null,
      matchStartTime: now,
      roundStartTime: now,
      currentRoundMoves: [],
      roundHistory: [],
      isPublicLive: this.isPublicLive,
    };

    this.handlePageUnload = () => {
      this.destroy();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this.handlePageUnload);
      window.addEventListener('pagehide', this.handlePageUnload);
    }

    this.initBroadcastChannel();
    this.initPeer();
    this.startJoinHandshakeIfGuest();
    this.startLiveBroadcastIfHost();
  }

  private recordActivity() {
    this.lastActivityAt = Date.now();
  }

  public getState(): GameState {
    return this.state;
  }

  public setPublicLive(enabled: boolean) {
    this.isPublicLive = enabled;
    this.state.isPublicLive = enabled;
    if (this.myRole === 'host') {
      if (enabled) {
        this.recordActivity();
        this.publishLiveStatus();
      } else {
        liveMatchRegistry.removeRoom(this.roomCode);
      }
      this.broadcastState();
    }
  }

  private startLiveBroadcastIfHost() {
    if (this.myRole === 'host' && this.isPublicLive) {
      this.publishLiveStatus();
    }
    this.liveAnnounceInterval = setInterval(() => {
      if (this.isDestroyed) return;
      if (this.myRole === 'host' && this.isPublicLive) {
        this.publishLiveStatus();
      }
    }, 3500);
  }

  private publishLiveStatus() {
    if (this.myRole !== 'host' || !this.isPublicLive || this.isDestroyed) return;
    // Automatically remove from See Live Matches if no move or reaction for 2 minutes
    if (Date.now() - this.lastActivityAt > INACTIVITY_TIMEOUT_MS) {
      liveMatchRegistry.removeRoom(this.roomCode);
      return;
    }
    liveMatchRegistry.announceRoom({
      roomCode: this.roomCode,
      hostName: this.state.players.X?.name || this.myName,
      guestName: this.state.players.O?.name || null,
      round: this.state.round,
      scores: { ...this.state.scores },
      spectatorCount: this.state.spectators.length,
      status: this.state.status,
      updatedAt: this.lastActivityAt,
    });
  }

  private startJoinHandshakeIfGuest() {
    if (this.myRole === 'host') return;

    this.sendJoinRequest();

    this.joinRetryInterval = setInterval(() => {
      if (this.isDestroyed || this.myRole === 'host' || this.joinAccepted) {
        if (this.joinRetryInterval) {
          clearInterval(this.joinRetryInterval);
          this.joinRetryInterval = null;
        }
        return;
      }
      this.sendJoinRequest();
    }, 1200);
  }

  private sendToHost(msg: NetworkMessage) {
    if (this.isDestroyed) return;
    if (this.hostConnection && this.hostConnection.open) {
      try {
        this.hostConnection.send(msg);
      } catch {}
    }
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(msg);
      } catch {}
    }
  }

  private sendJoinRequest() {
    if (this.isDestroyed || this.myRole === 'host') return;
    const joinMsg: NetworkMessage = {
      type: 'JOIN_REQUEST',
      role: this.myRole === 'spectator' ? 'spectator' : 'guest',
      name: this.myName,
      peerId: this.myId,
    };
    this.sendToHost(joinMsg);
  }

  private initBroadcastChannel() {
    if (typeof window === 'undefined' || !window.BroadcastChannel) return;
    try {
      this.broadcastChannel = new BroadcastChannel(`sb_channel_${this.roomCode}`);
      this.broadcastChannel.onmessage = (event) => {
        if (this.isDestroyed) return;
        this.handleMessage(event.data);
      };
    } catch {
      // BroadcastChannel optional fallback
    }
  }

  private broadcast(msg: NetworkMessage) {
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(msg);
      } catch {}
    }
    this.connections.forEach((conn) => {
      if (conn.open) {
        try {
          conn.send(msg);
        } catch {}
      }
    });
  }

  private initPeer() {
    this.callbacks.onConnectionStatusChange('connecting');

    const peerId =
      this.myRole === 'host'
        ? `sb-room-${this.roomCode}-host`
        : `sb-room-${this.roomCode}-${this.myRole}-${Math.random().toString(36).substring(2, 7)}`;

    this.peer = new Peer(peerId, {
      debug: 0,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
        ],
      },
    });

    this.peer.on('open', (id) => {
      const oldId = this.myId;
      this.myId = id;
      if (this.myRole === 'host') {
        if (this.state.players.X && this.state.players.X.id === oldId) {
          this.state.players.X.id = id;
        }
        this.callbacks.onConnectionStatusChange('connected');
        this.callbacks.onStateChange({ ...this.state });
        this.publishLiveStatus();
      } else {
        if (this.myRole === 'guest' && this.state.players.O && this.state.players.O.id === oldId) {
          this.state.players.O.id = id;
        }
        this.connectToHost();
      }
    });

    this.peer.on('connection', (conn) => {
      this.handleIncomingConnection(conn);
    });

    this.peer.on('error', (err) => {
      if (err.type === 'unavailable-id') {
        if (this.myRole === 'host') {
          this.myRole = 'guest';
          this.callbacks.onRoleChange?.('guest');
          this.state.players.O = { name: this.myName, role: 'guest', mark: 'O', id: this.myId };
          this.peer?.destroy();
          setTimeout(() => {
            this.initPeer();
            this.startJoinHandshakeIfGuest();
          }, 250);
          return;
        }
      } else if (err.type === 'peer-unavailable') {
        // Host peer does not exist anymore (room closed/left) -> purge from Live Matches
        if (this.myRole !== 'host') {
          liveMatchRegistry.removeRoom(this.roomCode);
        }
      }
      this.callbacks.onConnectionStatusChange('connecting', err.message);
    });

    this.peer.on('disconnected', () => {
      if (!this.isDestroyed) {
        this.peer?.reconnect();
      }
    });
  }

  private connectToHost() {
    if (!this.peer) return;
    const hostPeerId = `sb-room-${this.roomCode}-host`;
    const conn = this.peer.connect(hostPeerId, { reliable: true });

    conn.on('open', () => {
      this.hostConnection = conn;
      this.connections.set(conn.peer, conn);
      this.callbacks.onConnectionStatusChange('connected');
      this.sendJoinRequest();
    });

    conn.on('data', (data) => {
      this.handleMessage(data as NetworkMessage);
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
      liveMatchRegistry.removeRoom(this.roomCode);
      this.callbacks.onConnectionStatusChange('disconnected', 'Host disconnected');
    });

    conn.on('error', () => {
      this.callbacks.onConnectionStatusChange('connecting');
    });
  }

  private handleIncomingConnection(conn: DataConnection) {
    conn.on('open', () => {
      this.connections.set(conn.peer, conn);
      this.callbacks.onConnectionStatusChange('connected');
      if (this.myRole === 'host') {
        conn.send({
          type: 'STATE_SYNC',
          payload: this.state,
        });
      }
    });

    conn.on('data', (data) => {
      this.handleMessage(data as NetworkMessage, conn);
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
      this.removeDisconnectedPeer(conn.peer);
    });
  }

  private removeDisconnectedPeer(peerId: string) {
    if (this.myRole !== 'host') return;
    const remainingSpecs = this.state.spectators.filter((s) => s.id !== peerId);
    let updated = false;
    if (remainingSpecs.length !== this.state.spectators.length) {
      this.state.spectators = remainingSpecs;
      updated = true;
    }
    if (this.state.players.O && this.state.players.O.id === peerId) {
      this.state.players.O = null;
      updated = true;
    }
    if (updated) {
      this.broadcastState();
    }
  }

  private handleMessage(msg: NetworkMessage, sourceConn?: DataConnection) {
    switch (msg.type) {
      case 'STATE_SYNC': {
        this.state = msg.payload;
        if (this.myRole === 'guest' && !this.state.players.O) {
          this.state.players.O = {
            name: this.myName,
            role: 'guest',
            mark: 'O',
            id: this.myId,
          };
          this.sendJoinRequest();
        }
        if (this.myRole === 'guest' && this.state.players.O?.id === this.myId) {
          this.joinAccepted = true;
          this.callbacks.onConnectionStatusChange('connected');
        }
        this.callbacks.onStateChange({ ...this.state });
        break;
      }

      case 'JOIN_REQUEST': {
        if (this.myRole === 'host') {
          let assignedRole: UserRole = 'spectator';
          let assignedMark: 'X' | 'O' | null = null;

          const wantsToPlay = msg.role === 'player' || msg.role === 'guest';
          const currentO = this.state.players.O;
          const isCurrentOConnOpen = currentO ? (this.connections.get(currentO.id)?.open ?? false) : false;
          const isSlotOAvailable =
            !currentO ||
            currentO.id === msg.peerId ||
            currentO.name === msg.name ||
            !isCurrentOConnOpen;

          if (wantsToPlay && isSlotOAvailable) {
            assignedRole = 'guest';
            assignedMark = 'O';
            this.recordActivity();
            this.state.players.O = {
              name: msg.name,
              role: 'guest',
              mark: 'O',
              id: msg.peerId,
            };
            this.state.spectators = this.state.spectators.filter((s) => s.id !== msg.peerId);
          } else {
            assignedRole = 'spectator';
            assignedMark = null;
            if (!this.state.spectators.some((s) => s.id === msg.peerId)) {
              this.state.spectators.push({ id: msg.peerId, name: msg.name });
            }
          }

          const acceptedMsg: NetworkMessage = {
            type: 'JOIN_ACCEPTED',
            role: assignedRole,
            mark: assignedMark,
            state: this.state,
            targetPeerId: msg.peerId,
          };

          if (sourceConn && sourceConn.open) {
            try {
              sourceConn.send(acceptedMsg);
            } catch {}
          }
          this.broadcast(acceptedMsg);
          this.broadcastState();
        }
        break;
      }

      case 'JOIN_ACCEPTED': {
        if (msg.targetPeerId && msg.targetPeerId !== this.myId) {
          break;
        }
        this.joinAccepted = true;
        this.myRole = msg.role;
        this.callbacks.onRoleChange?.(msg.role);
        this.state = msg.state;
        this.callbacks.onStateChange({ ...this.state });
        this.callbacks.onConnectionStatusChange('connected');
        break;
      }

      case 'PLAYER_LEAVE': {
        this.removeDisconnectedPeer(msg.peerId);
        break;
      }

      case 'MOVE': {
        if (this.myRole === 'host') {
          if (msg.round !== undefined && msg.round !== this.state.round) {
            break;
          }
          this.processMove(msg.index, msg.player);
        }
        break;
      }

      case 'REMATCH_REQ': {
        if (this.myRole === 'host') {
          if (this.state.status === 'playing') break;
          if (msg.round !== undefined && msg.round !== this.state.round) break;
          this.recordActivity();

          if (this.state.rematchRequestedBy && this.state.rematchRequestedBy !== msg.player) {
            this.executeRematch(msg.round);
          } else if (this.state.rematchRequestedBy !== msg.player) {
            this.state.rematchRequestedBy = msg.player;
            this.broadcastState();
          }
        }
        break;
      }

      case 'REMATCH_ACCEPT': {
        if (this.myRole === 'host') {
          this.recordActivity();
          this.executeRematch(msg.round);
        }
        break;
      }

      case 'REACTION': {
        this.recordActivity();
        this.callbacks.onReactionReceived(msg.emoji, msg.sender);
        if (this.myRole === 'host') {
          this.connections.forEach((conn) => {
            if (conn !== sourceConn && conn.open) {
              conn.send(msg);
            }
          });
          if (this.isPublicLive) {
            this.publishLiveStatus();
          }
        }
        break;
      }

      case 'PING':
        break;
    }
  }

  public makeMove(index: number, player: 'X' | 'O') {
    if (this.state.status !== 'playing') return;
    if (this.state.currentTurn !== player) return;

    if (this.myRole === 'host') {
      this.processMove(index, player);
    } else {
      const moveMsg: NetworkMessage = {
        type: 'MOVE',
        index,
        player,
        round: this.state.round,
      };
      this.sendToHost(moveMsg);
    }
  }

  private processMove(index: number, player: 'X' | 'O') {
    const result = applyMove(
      this.state.board,
      index,
      player,
      this.state.currentTurn,
      this.state.status
    );

    if (!result) return;

    this.recordActivity();
    const now = Date.now();
    const elapsedSeconds = Math.max(0, Math.round((now - this.state.roundStartTime) / 1000));
    const playerName =
      player === 'X'
        ? this.state.players.X?.name || 'Player X'
        : this.state.players.O?.name || 'Player O';

    const moveRecord: MoveRecord = {
      moveNumber: this.state.currentRoundMoves.length + 1,
      player,
      playerName,
      cellIndex: index,
      elapsedSeconds,
    };

    const nextMoves = [...this.state.currentRoundMoves, moveRecord];

    this.state.board = result.nextBoard;
    this.state.currentTurn = result.nextTurn;
    this.state.status = result.newStatus;
    this.state.winInfo = result.winInfo;
    this.state.currentRoundMoves = nextMoves;

    if (result.newStatus === 'won' && result.winInfo) {
      if (result.winInfo.winner === 'X') {
        this.state.scores.X += 1;
      } else {
        this.state.scores.O += 1;
      }
      const winnerMark = result.winInfo.winner;
      const winnerName =
        winnerMark === 'X'
          ? this.state.players.X?.name || 'Player X'
          : this.state.players.O?.name || 'Player O';

      const roundRecord: RoundRecord = {
        round: this.state.round,
        winner: winnerMark,
        winnerName,
        durationSeconds: Math.max(1, elapsedSeconds),
        moves: nextMoves,
        finalMove: moveRecord,
        finalBoard: [...result.nextBoard],
        winLine: result.winInfo.line,
        completedAt: now,
      };
      if (!this.state.roundHistory.some((r) => r.round === this.state.round)) {
        this.state.roundHistory = [...this.state.roundHistory, roundRecord];
      }
    } else if (result.newStatus === 'draw') {
      this.state.scores.ties += 1;
      const roundRecord: RoundRecord = {
        round: this.state.round,
        winner: 'draw',
        winnerName: 'Draw',
        durationSeconds: Math.max(1, elapsedSeconds),
        moves: nextMoves,
        finalMove: moveRecord,
        finalBoard: [...result.nextBoard],
        winLine: null,
        completedAt: now,
      };
      if (!this.state.roundHistory.some((r) => r.round === this.state.round)) {
        this.state.roundHistory = [...this.state.roundHistory, roundRecord];
      }
    }

    this.broadcastState();
  }

  public requestRematch(player: 'X' | 'O') {
    if (this.state.status === 'playing') return;
    this.recordActivity();

    if (this.myRole === 'host') {
      if (this.state.rematchRequestedBy && this.state.rematchRequestedBy !== player) {
        this.executeRematch(this.state.round);
      } else if (this.state.rematchRequestedBy !== player) {
        this.state.rematchRequestedBy = player;
        this.broadcastState();
      }
    } else {
      const msg: NetworkMessage = {
        type: 'REMATCH_REQ',
        player,
        round: this.state.round,
      };
      this.sendToHost(msg);
    }
  }

  public acceptRematch() {
    if (this.state.status === 'playing') return;
    this.recordActivity();

    if (this.myRole === 'host') {
      this.executeRematch(this.state.round);
    } else {
      const msg: NetworkMessage = {
        type: 'REMATCH_ACCEPT',
        round: this.state.round,
      };
      this.sendToHost(msg);
    }
  }

  private executeRematch(expectedRound?: number) {
    // Strictly prevent duplicate rematch execution (fixes Round 4 -> Round 6 skip bug)
    if (this.state.status === 'playing') return;
    if (expectedRound !== undefined && expectedRound !== this.state.round) return;

    this.recordActivity();
    const nextRound = this.state.round + 1;
    this.state.board = createEmptyBoard();
    this.state.status = 'playing';
    this.state.winInfo = null;
    this.state.rematchRequestedBy = null;
    this.state.round = nextRound;
    this.state.roundStartTime = Date.now();
    this.state.currentRoundMoves = [];
    // Alternate starting turn each round (1 -> X, 2 -> O, 3 -> X, 4 -> O, 5 -> X...)
    this.state.currentTurn = nextRound % 2 === 1 ? 'X' : 'O';
    this.broadcastState();
  }

  public sendReaction(emoji: string) {
    this.recordActivity();
    const msg: NetworkMessage = {
      type: 'REACTION',
      emoji,
      sender: this.myName,
    };
    this.callbacks.onReactionReceived(emoji, this.myName);
    this.broadcast(msg);
    if (this.myRole === 'host' && this.isPublicLive) {
      this.publishLiveStatus();
    }
  }

  private broadcastState() {
    const syncMsg: NetworkMessage = {
      type: 'STATE_SYNC',
      payload: { ...this.state },
    };
    this.callbacks.onStateChange({ ...this.state });
    this.broadcast(syncMsg);
    if (this.myRole === 'host' && this.isPublicLive) {
      this.publishLiveStatus();
    }
  }

  public destroy() {
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    if (typeof window !== 'undefined' && this.handlePageUnload) {
      window.removeEventListener('beforeunload', this.handlePageUnload);
      window.removeEventListener('pagehide', this.handlePageUnload);
    }
    if (this.joinRetryInterval) {
      clearInterval(this.joinRetryInterval);
      this.joinRetryInterval = null;
    }
    if (this.liveAnnounceInterval) {
      clearInterval(this.liveAnnounceInterval);
      this.liveAnnounceInterval = null;
    }
    if (this.myRole === 'host') {
      liveMatchRegistry.removeRoom(this.roomCode);
    } else {
      this.sendToHost({ type: 'PLAYER_LEAVE', peerId: this.myId });
    }
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.close();
      } catch {}
    }
    this.connections.forEach((conn) => {
      try {
        conn.close();
      } catch {}
    });
    this.connections.clear();
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch {}
      this.peer = null;
    }
  }
}
