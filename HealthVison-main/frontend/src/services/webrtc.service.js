import { io } from 'socket.io-client';
import Peer from 'simple-peer-light';

const getSocketURL = () => {
    const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
    return apiUrl.replace(/\/api$/, '');
};

const SOCKET_URL = getSocketURL();

class WebRTCService {
    constructor() {
        this.socket = null;
        this.peer = null;
        this.stream = null;
        this.currentRoomId = null;
    }

    connect(userId) {
        if (this.socket) return;

        this.socket = io(SOCKET_URL, {
            rejectUnauthorized: false,
            transports: ['websocket', 'polling'],
            secure: true
        });

        this.socket.on('connect', () => {
            this.socket.emit('register', userId);
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error details:', error);
            // Fallback for self-signed certificates in some browsers
            if (error.message === 'xhr poll error' || error.message === 'websocket error') {
                console.log('Attempting reconnection with different options...');
            }
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.destroyPeer();
    }

    joinRoom(roomId, appointmentId, userId) {
        if (!this.socket) return;
        this.currentRoomId = roomId;
        this.socket.emit('join-room', { roomId, appointmentId, userId });
    }

    leaveRoom(roomId, userId) {
        if (!this.socket) return;
        this.socket.emit('leave-room', { roomId, userId });
        this.currentRoomId = null;
        this.destroyPeer();
    }

    destroyPeer() {
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }
    }

    initializePeer(isInitiator, stream, onSignal, onStream, onClose) {
        this.destroyPeer();

        this.peer = new Peer({
            initiator: isInitiator,
            trickle: true,
            stream: stream,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    { urls: 'stun:stun2.l.google.com:19302' },
                    ...(import.meta.env.VITE_TURN_SERVER_URL ? [{
                        urls: import.meta.env.VITE_TURN_SERVER_URL,
                        username: import.meta.env.VITE_TURN_USERNAME,
                        credential: import.meta.env.VITE_TURN_PASSWORD
                    }] : [])
                ]
            }
        });

        this.peer.on('signal', (data) => {
            if (data.type === 'offer' || data.type === 'answer') {
                onSignal(data);
            } else if (data.candidate) {
                this.socket.emit('ice-candidate', { roomId: this.currentRoomId, candidate: data });
            }
        });

        this.peer.on('stream', (remoteStream) => {
            onStream(remoteStream);
        });

        this.peer.on('connect', () => {
            // P2P Connection established
        });

        this.peer.on('close', () => {
            onClose();
        });

        this.peer.on('error', (err) => {
            console.error('[WebRTC] Peer error:', err);
            onClose();
        });

        return this.peer;
    }

    signal(data) {
        if (this.peer) {
            this.peer.signal(data);
        } else {
            // Peer object is null
        }
    }

    emitOffer(roomId, offer) {
        if (this.socket) {
            this.socket.emit('offer', { roomId, offer });
        }
    }

    emitAnswer(roomId, answer) {
        if (this.socket) {
            this.socket.emit('answer', { roomId, answer });
        }
    }

    emitIceCandidate(roomId, candidate) {
        if (this.socket) {
            this.socket.emit('ice-candidate', { roomId, candidate });
        }
    }

    onUserJoined(callback) {
        if (this.socket) {
            this.socket.on('user-joined', callback);
        }
    }

    onOffer(callback) {
        if (this.socket) {
            this.socket.on('offer', callback);
        }
    }

    onAnswer(callback) {
        if (this.socket) {
            this.socket.on('answer', callback);
        }
    }

    onIceCandidate(callback) {
        if (this.socket) {
            this.socket.on('ice-candidate', callback);
        }
    }

    onUserLeft(callback) {
        if (this.socket) {
            this.socket.on('user-left', callback);
        }
    }

    removeListeners() {
        if (this.socket) {
            this.socket.off('user-joined');
            this.socket.off('offer');
            this.socket.off('answer');
            this.socket.off('ice-candidate');
            this.socket.off('user-left');
        }
    }
}

const webrtcService = new WebRTCService();
export default webrtcService;
