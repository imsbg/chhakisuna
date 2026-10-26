/**
 * Public Live Matches Discovery & Phone Cache Engine
 * Uses Phone Cache (localStorage + CacheStorage) + BroadcastChannel + WebRTC P2P Lobby Hub
 * so any creator who enables "Make Room Public" has their live room appear in "See Live Matches".
 */

import Peer, { DataConnection } from 'peerjs';

export interface LiveMatchSummary {
  roomCode: string;
  hostName: string;
  guestName: string | null;
  round: number;
  scores: {
    X: number;
    O: number;
    ties: number;
  };
  spectatorCount: number;
  status: 'playing' | 'won' | 'draw';
  updatedAt: number;
}

type LobbyMessage =
  | { type: 'ROOM_ANNOUNCE'; match: LiveMatchSummary }
  | { type: 'ROOM_REMOVE'; roomCode: string }
  | { type: 'LOBBY_SYNC_REQ' }
  | { type: 'LOBBY_SYNC_RES'; matches: LiveMatchSummary[] };

const STORAGE_KEY = 'sb_ttt_public_live_matches_cache_v1';
const REMOVED_STORAGE_KEY = 'sb_ttt_removed_live_matches_v1';
const CACHE_NAME = 'sb-ttt-live-matches-phone-cache-v1';
const CACHE_URL = '/__sb_live_matches_cache__.json';
export const INACTIVITY_TIMEOUT_MS = 1000 * 60 * 2; // 2 minutes inactivity limit (no move or reaction)
const LOBBY_HUB_PEER_ID = 'sb-chhaki-suna-public-lobby-hub-v1';

export class LiveMatchRegistry {
  private matches: Map<string, LiveMatchSummary> = new Map();
  private removedRooms: Map<string, number> = new Map();
  private listeners: Set<(matches: LiveMatchSummary[]) => void> = new Set();
  private channel: BroadcastChannel | null = null;
  private peer: Peer | null = null;
  private isHub: boolean = false;
  private hubConn: DataConnection | null = null;
  private hubClients: Map<string, DataConnection> = new Map();
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.loadFromPhoneCache();
    this.initBroadcastChannel();
    this.initWebRTCLobbyMesh();

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY || e.key === REMOVED_STORAGE_KEY) {
          this.syncFromLocalStorage();
        }
      });
    }

    this.cleanupTimer = setInterval(() => {
      this.pruneStaleMatches();
    }, 3000);
  }

  public subscribe(listener: (matches: LiveMatchSummary[]) => void): () => void {
    this.listeners.add(listener);
    listener(this.getLiveMatches());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getLiveMatches(): LiveMatchSummary[] {
    this.pruneStaleMatches(false);
    return Array.from(this.matches.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  public announceRoom(match: LiveMatchSummary) {
    const code = match.roomCode.toUpperCase();
    const now = Date.now();
    const activityTime = match.updatedAt || now;

    // Do not announce if already inactive for > 2 minutes
    if (now - activityTime > INACTIVITY_TIMEOUT_MS) {
      this.removeRoom(code);
      return;
    }

    const normalized: LiveMatchSummary = {
      ...match,
      roomCode: code,
      updatedAt: activityTime,
    };
    this.removedRooms.delete(code);
    this.matches.set(code, normalized);
    this.saveToPhoneCache();
    this.notifyListeners();

    const msg: LobbyMessage = { type: 'ROOM_ANNOUNCE', match: normalized };
    this.sendLobbyMessage(msg);
  }

  public removeRoom(roomCode: string) {
    const code = roomCode.toUpperCase();
    const now = Date.now();
    this.removedRooms.set(code, now);
    const hadMatch = this.matches.delete(code);
    this.saveToPhoneCache();
    if (hadMatch) {
      this.notifyListeners();
    }
    const msg: LobbyMessage = { type: 'ROOM_REMOVE', roomCode: code };
    this.sendLobbyMessage(msg);
  }

  private isRoomRemovedOrStale(roomCode: string, updatedAt: number, now = Date.now()): boolean {
    if (!roomCode || !updatedAt) return true;
    if (now - updatedAt > INACTIVITY_TIMEOUT_MS) return true;
    const removedAt = this.removedRooms.get(roomCode.toUpperCase());
    if (removedAt !== undefined && updatedAt <= removedAt) return true;
    return false;
  }

  private notifyListeners() {
    const list = Array.from(this.matches.values()).sort((a, b) => b.updatedAt - a.updatedAt);
    this.listeners.forEach((cb) => cb(list));
  }

  private pruneStaleMatches(notify = true) {
    const now = Date.now();
    let changed = false;
    this.matches.forEach((val, key) => {
      if (this.isRoomRemovedOrStale(key, val.updatedAt, now)) {
        this.matches.delete(key);
        changed = true;
      }
    });
    // Also clean up old tombstones older than 10 minutes
    this.removedRooms.forEach((removedAt, key) => {
      if (now - removedAt > INACTIVITY_TIMEOUT_MS * 5) {
        this.removedRooms.delete(key);
      }
    });
    if (changed) {
      this.saveToPhoneCache();
      if (notify) this.notifyListeners();
    }
  }

  private syncFromLocalStorage() {
    if (typeof window === 'undefined') return;
    try {
      const removedRaw = localStorage.getItem(REMOVED_STORAGE_KEY);
      if (removedRaw) {
        const parsedRemoved = JSON.parse(removedRaw) as Record<string, number>;
        if (parsedRemoved && typeof parsedRemoved === 'object') {
          Object.entries(parsedRemoved).forEach(([k, ts]) => {
            const code = k.toUpperCase();
            this.removedRooms.set(code, Math.max(this.removedRooms.get(code) || 0, Number(ts) || 0));
          });
        }
      }

      const raw = localStorage.getItem(STORAGE_KEY);
      const nextMatches = new Map<string, LiveMatchSummary>();
      const now = Date.now();
      if (raw) {
        const parsed = JSON.parse(raw) as LiveMatchSummary[];
        if (Array.isArray(parsed)) {
          parsed.forEach((m) => {
            if (m && m.roomCode && !this.isRoomRemovedOrStale(m.roomCode, m.updatedAt, now)) {
              nextMatches.set(m.roomCode.toUpperCase(), m);
            }
          });
        }
      }
      this.matches = nextMatches;
      this.notifyListeners();
    } catch {}
  }

  private loadFromPhoneCache() {
    if (typeof window === 'undefined') return;
    try {
      const removedRaw = localStorage.getItem(REMOVED_STORAGE_KEY);
      if (removedRaw) {
        const parsedRemoved = JSON.parse(removedRaw) as Record<string, number>;
        if (parsedRemoved && typeof parsedRemoved === 'object') {
          Object.entries(parsedRemoved).forEach(([k, ts]) => {
            this.removedRooms.set(k.toUpperCase(), Number(ts) || 0);
          });
        }
      }

      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as LiveMatchSummary[];
        const now = Date.now();
        if (Array.isArray(parsed)) {
          parsed.forEach((m) => {
            if (m && m.roomCode && !this.isRoomRemovedOrStale(m.roomCode, m.updatedAt, now)) {
              this.matches.set(m.roomCode.toUpperCase(), m);
            }
          });
        }
      }
    } catch {
      // ignore storage error
    }

    // Also check CacheStorage on mobile browsers if available
    if (typeof window !== 'undefined' && 'caches' in window) {
      caches
        .open(CACHE_NAME)
        .then((cache) => cache.match(CACHE_URL))
        .then((res) => (res ? res.json() : null))
        .then((list: LiveMatchSummary[] | null) => {
          if (Array.isArray(list)) {
            const now = Date.now();
            let updated = false;
            list.forEach((m) => {
              if (m && m.roomCode && !this.isRoomRemovedOrStale(m.roomCode, m.updatedAt, now)) {
                const code = m.roomCode.toUpperCase();
                const existing = this.matches.get(code);
                if (!existing || existing.updatedAt < m.updatedAt) {
                  this.matches.set(code, m);
                  updated = true;
                }
              }
            });
            if (updated) this.notifyListeners();
          }
        })
        .catch(() => {});
    }
  }

  private saveToPhoneCache() {
    if (typeof window === 'undefined') return;
    const list = Array.from(this.matches.values());
    const removedObj: Record<string, number> = {};
    this.removedRooms.forEach((ts, code) => {
      removedObj[code] = ts;
    });
    try {
      localStorage.setItem(REMOVED_STORAGE_KEY, JSON.stringify(removedObj));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {}

    if ('caches' in window) {
      caches
        .open(CACHE_NAME)
        .then((cache) =>
          cache.put(
            CACHE_URL,
            new Response(JSON.stringify(list), {
              headers: { 'Content-Type': 'application/json' },
            })
          )
        )
        .catch(() => {});
    }
  }

  private initBroadcastChannel() {
    if (typeof window === 'undefined' || !window.BroadcastChannel) return;
    try {
      this.channel = new BroadcastChannel('sb_public_lobby_v1');
      this.channel.onmessage = (event) => {
        this.handleIncomingLobbyMessage(event.data as LobbyMessage);
      };
      // Request active rooms from other open tabs/windows
      this.channel.postMessage({ type: 'LOBBY_SYNC_REQ' } satisfies LobbyMessage);
    } catch {}
  }

  private initWebRTCLobbyMesh() {
    if (typeof window === 'undefined') return;
    try {
      // Attempt to act as or connect to the shared WebRTC public lobby hub
      const candidatePeer = new Peer(LOBBY_HUB_PEER_ID, { debug: 0 });

      candidatePeer.on('open', () => {
        // This device is now the active P2P Lobby Cache Hub!
        this.peer = candidatePeer;
        this.isHub = true;
      });

      candidatePeer.on('connection', (conn) => {
        conn.on('open', () => {
          this.hubClients.set(conn.peer, conn);
          conn.send({
            type: 'LOBBY_SYNC_RES',
            matches: this.getLiveMatches(),
          } satisfies LobbyMessage);
        });
        conn.on('data', (data) => {
          this.handleIncomingLobbyMessage(data as LobbyMessage, conn);
        });
        conn.on('close', () => {
          this.hubClients.delete(conn.peer);
        });
      });

      candidatePeer.on('error', (err) => {
        if (err.type === 'unavailable-id') {
          // Another device is already the P2P Hub; connect to it as a client
          candidatePeer.destroy();
          this.connectAsLobbyClient();
        }
      });
    } catch {}
  }

  private connectAsLobbyClient() {
    try {
      const clientPeer = new Peer(`sb-lobby-client-${Math.random().toString(36).substring(2, 8)}`, {
        debug: 0,
      });
      this.peer = clientPeer;
      this.isHub = false;

      clientPeer.on('open', () => {
        const conn = clientPeer.connect(LOBBY_HUB_PEER_ID, { reliable: true });
        conn.on('open', () => {
          this.hubConn = conn;
          conn.send({ type: 'LOBBY_SYNC_REQ' } satisfies LobbyMessage);
          if (this.matches.size > 0) {
            conn.send({
              type: 'LOBBY_SYNC_RES',
              matches: this.getLiveMatches(),
            } satisfies LobbyMessage);
          }
        });
        conn.on('data', (data) => {
          this.handleIncomingLobbyMessage(data as LobbyMessage);
        });
      });
    } catch {}
  }

  private sendLobbyMessage(msg: LobbyMessage) {
    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch {}
    }
    if (this.isHub) {
      this.hubClients.forEach((conn) => {
        if (conn.open) {
          try {
            conn.send(msg);
          } catch {}
        }
      });
    } else if (this.hubConn?.open) {
      try {
        this.hubConn.send(msg);
      } catch {}
    }
  }

  private handleIncomingLobbyMessage(msg: LobbyMessage, sourceConn?: DataConnection) {
    if (!msg || typeof msg !== 'object') return;
    switch (msg.type) {
      case 'ROOM_ANNOUNCE': {
        const m = msg.match;
        if (m && m.roomCode && !this.isRoomRemovedOrStale(m.roomCode, m.updatedAt)) {
          const code = m.roomCode.toUpperCase();
          this.removedRooms.delete(code);
          this.matches.set(code, m);
          this.saveToPhoneCache();
          this.notifyListeners();
          if (this.isHub) {
            this.hubClients.forEach((c) => {
              if (c !== sourceConn && c.open) {
                try {
                  c.send(msg);
                } catch {}
              }
            });
          }
        }
        break;
      }
      case 'ROOM_REMOVE': {
        const code = msg.roomCode?.toUpperCase();
        if (code) {
          this.removedRooms.set(code, Date.now());
          const hadMatch = this.matches.delete(code);
          this.saveToPhoneCache();
          if (hadMatch) {
            this.notifyListeners();
          }
          if (this.isHub) {
            this.hubClients.forEach((c) => {
              if (c !== sourceConn && c.open) {
                try {
                  c.send(msg);
                } catch {}
              }
            });
          }
        }
        break;
      }
      case 'LOBBY_SYNC_REQ': {
        const current = this.getLiveMatches();
        if (current.length > 0) {
          const res: LobbyMessage = { type: 'LOBBY_SYNC_RES', matches: current };
          if (sourceConn && sourceConn.open) {
            try {
              sourceConn.send(res);
            } catch {}
          } else if (this.channel) {
            try {
              this.channel.postMessage(res);
            } catch {}
          }
        }
        break;
      }
      case 'LOBBY_SYNC_RES': {
        if (Array.isArray(msg.matches)) {
          let changed = false;
          const now = Date.now();
          msg.matches.forEach((m) => {
            if (m && m.roomCode && !this.isRoomRemovedOrStale(m.roomCode, m.updatedAt, now)) {
              const code = m.roomCode.toUpperCase();
              const existing = this.matches.get(code);
              if (!existing || existing.updatedAt < m.updatedAt) {
                this.matches.set(code, m);
                changed = true;
              }
            }
          });
          if (changed) {
            this.saveToPhoneCache();
            this.notifyListeners();
          }
        }
        break;
      }
    }
  }
}

export const liveMatchRegistry = new LiveMatchRegistry();
