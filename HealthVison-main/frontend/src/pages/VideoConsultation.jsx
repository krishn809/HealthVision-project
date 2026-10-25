import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Video, VideoOff, Mic, MicOff, PhoneOff, User, Settings, Shield, X } from 'lucide-react';
import webrtcService from '../services/webrtc.service';
import authService from '../services/auth.service';
import appointmentService from '../services/appointment.service';
import toast from 'react-hot-toast';

export default function VideoConsultation() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const appointmentId = new URLSearchParams(location.search).get('appointmentId');
    const user = authService.getCurrentUser();
    const userId = user?._id || user?.id;

    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isConnecting, setIsConnecting] = useState(true);
    const [callEnded, setCallEnded] = useState(false);
    const [doctorName, setDoctorName] = useState('Remote Participant');
    const [showSettings, setShowSettings] = useState(false);
    const [devices, setDevices] = useState({ video: [], audio: [] });

    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const streamRef = useRef(null);

    useEffect(() => {
        if (!userId || !roomId) {
            navigate('/login');
            return;
        }

        const fetchAppointmentDetails = async () => {
            if (appointmentId) {
                try {
                    const response = await appointmentService.getAppointmentById(appointmentId);
                    const appointment = response?.data;

                    if (appointment) {
                        let name = user.role === 'doctor'
                            ? (appointment.userId?.name?.first || appointment.userId?.name || 'Patient')
                            : (appointment.doctorId?.name || 'Doctor');

                        if (user.role === 'patient' && name !== 'Doctor' && !name.toLowerCase().startsWith('dr.')) {
                            name = `Dr. ${name}`;
                        }
                        setDoctorName(name);
                    }
                } catch (error) {
                    console.error('Error fetching appointment details:', error);
                }
            }
        };

        fetchAppointmentDetails();

        const fetchDevices = async () => {
            try {
                const devs = await navigator.mediaDevices.enumerateDevices();
                setDevices({
                    video: devs.filter(d => d.kind === 'videoinput'),
                    audio: devs.filter(d => d.kind === 'audioinput')
                });
            } catch (error) {
                console.error('Error fetching devices:', error);
            }
        };
        fetchDevices();
    }, [appointmentId, userId, roomId, navigate]);

    useEffect(() => {
        if (!userId || !roomId) return;

        let mounted = true;

        const initCall = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (!mounted) {
                    stream.getTracks().forEach(t => t.stop());
                    return;
                }

                setLocalStream(stream);
                streamRef.current = stream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                webrtcService.connect(userId);
                webrtcService.joinRoom(roomId, appointmentId, userId);

                webrtcService.onUserJoined(({ userId: joinedUserId }) => {
                    webrtcService.initializePeer(
                        true,
                        stream,
                        (offer) => {
                            webrtcService.emitOffer(roomId, offer);
                        },
                        (rStream) => {
                            setRemoteStream(rStream);
                            if (remoteVideoRef.current) {
                                remoteVideoRef.current.srcObject = rStream;
                            }
                            setIsConnecting(false);
                        },
                        handleCallEnd
                    );
                });

                webrtcService.onOffer(({ offer }) => {
                    webrtcService.initializePeer(
                        false,
                        stream,
                        (answer) => {
                            webrtcService.emitAnswer(roomId, answer);
                        },
                        (rStream) => {
                            setRemoteStream(rStream);
                            if (remoteVideoRef.current) {
                                remoteVideoRef.current.srcObject = rStream;
                            }
                            setIsConnecting(false);
                        },
                        handleCallEnd
                    );
                    webrtcService.signal(offer);
                });

                webrtcService.onAnswer(({ answer }) => {
                    webrtcService.signal(answer);
                });

                webrtcService.onIceCandidate(({ candidate }) => {
                    webrtcService.signal(candidate);
                });

                webrtcService.onUserLeft(() => {
                    setRemoteStream(null);
                    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
                    toast.error('The other party has left the consultation');
                });

            } catch (error) {
                console.error('Error accessing media devices:', error);
                toast.error('Could not access camera/microphone. Please check permissions.');
                setIsConnecting(false);
            }
        };

        initCall();

        return () => {
            mounted = false;
            webrtcService.removeListeners();

            // Comprehensive cleanup using ref to avoid closure issues
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }

            setLocalStream(null);
            webrtcService.leaveRoom(roomId, userId);
            webrtcService.disconnect();
        };
    }, [roomId, userId, appointmentId, navigate]);

    const handleCallEnd = () => {
        setCallEnded(true);

        // Stop all tracks in the local stream explicitly
        if (localStream) {
            localStream.getTracks().forEach(track => {
                track.stop();
                console.log(`Stopped track: ${track.kind}`);
            });
        }

        // Stop remote tracks as well if they exist
        if (remoteStream) {
            remoteStream.getTracks().forEach(track => track.stop());
        }

        webrtcService.leaveRoom(roomId, userId);
        webrtcService.disconnect();

        toast.success('Consultation ended');
        navigate('/appointments');
    };

    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoOff(!isVideoOff);
        }
    };

    // Reactive stream assignment
    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            // Ensure video attempts to play
            remoteVideoRef.current.play().catch(e => {
                // Auto-play prevented
            });
        }
    }, [remoteStream]);

    // Same for local stream to be extra safe
    useEffect(() => {
        if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    return (
        <div className="fixed inset-0 bg-gray-900 flex flex-col z-50 overflow-hidden">
            {/* Header */}
            <div className="bg-gray-800 p-4 border-b border-gray-700 flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-green-400" />
                    <div>
                        <h2 className="font-bold text-lg">Secure Consultation</h2>
                        <p className="text-xs text-gray-400">Room ID: {roomId}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gray-700 rounded-full text-xs font-medium">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Active Session
                    </div>
                    <button
                        onClick={() => setShowSettings(true)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        aria-label="Settings"
                    >
                        <Settings className="w-5 h-5 text-gray-300" />
                    </button>
                </div>
            </div>

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-gray-800 border border-gray-700 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Settings className="w-5 h-5 text-blue-400" />
                                Call Settings
                            </h3>
                            <button
                                onClick={() => setShowSettings(false)}
                                className="p-2 hover:bg-gray-700 rounded-full text-gray-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Connection Info</h4>
                                <div className="bg-gray-900/50 rounded-2xl p-4 border border-gray-700/50 space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400">Security</span>
                                        <span className="text-green-400 font-medium flex items-center gap-1">
                                            <Shield className="w-3 h-3" /> E2E Encrypted
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400">Status</span>
                                        <span className="text-white">Active</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400">Room</span>
                                        <span className="text-gray-300 font-mono text-xs">{roomId}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Devices</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                            <Video className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-gray-400 text-xs">Camera</p>
                                            <p className="text-white truncate">{localStream?.getVideoTracks()[0]?.label || 'Standard Camera'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                                            <Mic className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-gray-400 text-xs">Microphone</p>
                                            <p className="text-white truncate">{localStream?.getAudioTracks()[0]?.label || 'Default Microphone'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-900/30">
                            <button
                                onClick={() => setShowSettings(false)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Video Grid */}
            <div className="flex-1 relative p-4 grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-fr max-h-[calc(100vh-160px)]">
                {/* Remote Video Container */}
                <div className="relative bg-black rounded-3xl overflow-hidden border border-gray-800 shadow-2xl flex items-center justify-center group">
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className={`w-full h-full object-cover bg-black transition-opacity duration-700 ${!remoteStream ? 'opacity-0' : 'opacity-100'}`}
                    />

                    {!remoteStream && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-1000">
                            <div className="relative mb-6 mx-auto w-24 h-24">
                                <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
                                <div className="relative w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700 shadow-inner">
                                    <User className="w-12 h-12 text-gray-500" />
                                </div>
                            </div>
                            <h3 className="text-white font-bold text-xl mb-2">Connecting Specialists</h3>
                            <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
                                {isConnecting
                                    ? 'Setting up encrypted video line...'
                                    : 'The specialist has been notified and will join shortly. Please stay on this screen.'}
                            </p>
                        </div>
                    )}

                    <div className="absolute top-4 right-4 flex gap-2">
                        {remoteStream && (
                            <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-green-400 border border-green-500/30 flex items-center gap-1.5 uppercase tracking-widest">
                                <div className="flex gap-0.5 items-end h-2">
                                    <div className="w-0.5 h-1 bg-current opacity-40"></div>
                                    <div className="w-0.5 h-1.5 bg-current opacity-70"></div>
                                    <div className="w-0.5 h-2 bg-current"></div>
                                </div>
                                High Quality
                            </div>
                        )}
                    </div>

                    <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl text-white text-sm font-bold border border-white/10 flex items-center gap-2 shadow-lg group-hover:bg-blue-600 transition-colors">
                        <div className={`w-2 h-2 rounded-full ${remoteStream ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                        {doctorName}
                    </div>
                </div>

                {/* Local Video Container */}
                <div className="relative bg-black rounded-2xl overflow-hidden border border-gray-800 shadow-2xl flex items-center justify-center">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
                    />
                    {isVideoOff && (
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
                                <VideoOff className="w-10 h-10 text-gray-600" />
                            </div>
                            <p className="text-gray-500 text-sm">Your camera is off</p>
                        </div>
                    )}
                    <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-sm font-medium border border-white/10 uppercase tracking-wider">
                        You {isMuted && '(Muted)'}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-gray-800/80 backdrop-blur-lg p-6 border-t border-gray-700 flex items-center justify-center gap-4 sm:gap-8">
                <button
                    onClick={toggleMute}
                    className={`p-4 rounded-full transition-all duration-300 shadow-lg ${isMuted ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}`}
                    title={isMuted ? 'Unmute' : 'Mute'}
                    aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                    aria-pressed={isMuted}
                >
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>

                <button
                    onClick={handleCallEnd}
                    className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all duration-300 shadow-xl transform scale-110 active:scale-95 flex items-center gap-2 px-6"
                    title="End Consultation"
                    aria-label="End Call"
                >
                    <PhoneOff className="w-6 h-6" />
                    <span className="hidden sm:inline font-bold">End Call</span>
                </button>

                <button
                    onClick={toggleVideo}
                    className={`p-4 rounded-full transition-all duration-300 shadow-lg ${isVideoOff ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}`}
                    title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
                    aria-label={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
                    aria-pressed={isVideoOff}
                >
                    {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                </button>
            </div>
        </div>
    );
}
