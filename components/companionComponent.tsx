'use client';

import { useEffect, useRef, useState } from 'react';
import { cn, configureAssistant, getSubjectColor } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import Image from "next/image";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import soundwaves from '@/constants/soundwaves.json';
import { addToSessionHistory } from "@/lib/actions/companion.actions";

enum CallStatus {
    INACTIVE = 'INACTIVE',
    CONNECTING = 'CONNECTING',
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED',
}

const CompanionComponent = ({ companionId, subject, topic, name, userName, userImage, style, voice }: CompanionComponentProps) => {
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [messages, setMessages] = useState<SavedMessage[]>([]);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [permissionState, setPermissionState] = useState<'granted'|'denied'|'prompt'>('prompt');
    const lottieRef = useRef<LottieRefCurrentProps>(null);

    // On mount, check existing permission and prompt if needed
    useEffect(() => {
        if (navigator.permissions) {
            navigator.permissions.query({ name: 'microphone' as PermissionName })
                .then(status => {
                    setPermissionState(status.state as any);
                    status.onchange = () => setPermissionState(status.state as any);
                });
        }
    }, []);

    // Standard MDN method: request mic with constraints
    const getLocalStream = () =>  {
        navigator.mediaDevices
            .getUserMedia({ video: false, audio: true })
            .then((stream) => {
                window.localStream = stream;
                window.localAudio.srcObject = stream;
                window.localAudio.autoplay = true;
            })
            .catch((err) => {
                console.error(`you got an error: ${err}`);
            });
    }

    const handleCall = async () => {
        // If we haven't yet asked, trigger the prompt
        if (permissionState === 'prompt') {
            const stream =  getLocalStream();
            if (!stream) {
                setShowPermissionModal(true);
                return;
            }
            // Stop tracks immediately since VAPI will manage mic
            stream.getTracks().forEach(t => t.stop());
        }
        // If denied, show settings modal
        if (permissionState === 'denied') {
            setShowPermissionModal(true);
            return;
        }

        // Proceed: start the VAPI call
        setCallStatus(CallStatus.CONNECTING);
        const overrides = {
            variableValues: { subject, topic, style },
            clientMessages: ['transcript'] as const,
            serverMessages: [] as const,
        };
        try {
            // @ts-expect-error
            vapi.start(configureAssistant(voice, style), overrides);
        } catch (err) {
            console.error('VAPI start failed:', err);
            setCallStatus(CallStatus.INACTIVE);
            setShowPermissionModal(true);
        }
    };

    const handleDisconnect = () => {
        setCallStatus(CallStatus.FINISHED);
        vapi.stop();
        addToSessionHistory(companionId);
    };

    useEffect(() => {
        const onStart = () => setCallStatus(CallStatus.ACTIVE);
        const onEnd = () => handleDisconnect();
        const onMessage = (msg: Message) => {
            if (msg.type === 'transcript' && msg.transcriptType === 'final') {
                setMessages(prev => [{ role: msg.role, content: msg.transcript }, ...prev]);
            }
        };
        const onSpeechStart = () => setIsSpeaking(true);
        const onSpeechEnd = () => setIsSpeaking(false);
        const onError = (error: Error) => {
            console.error('VAPI Error:', error);
            if (['NotAllowedError','NotReadableError'].includes((error as any).name)) {
                handleDisconnect();
                setShowPermissionModal(true);
            }
        };

        vapi.on('call-start', onStart);
        vapi.on('call-end', onEnd);
        vapi.on('message', onMessage);
        vapi.on('speech-start', onSpeechStart);
        vapi.on('speech-end', onSpeechEnd);
        vapi.on('error', onError);
        return () => {
            vapi.off('call-start', onStart);
            vapi.off('call-end', onEnd);
            vapi.off('message', onMessage);
            vapi.off('speech-start', onSpeechStart);
            vapi.off('speech-end', onSpeechEnd);
            vapi.off('error', onError);
        };
    }, []);

    useEffect(() => {
        isSpeaking ? lottieRef.current?.play() : lottieRef.current?.stop();
    }, [isSpeaking]);

    const toggleMic = () => {
        const muted = vapi.isMuted();
        vapi.setMuted(!muted);
        setIsMuted(!muted);
    };

    return (
        <>
            {showPermissionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-primary text-white rounded-2xl p-6 max-w-sm text-center shadow-lg">
                        <h2 className="text-xl font-bold mb-4">Microphone Permission</h2>
                        <p className="mb-6">
                            {permissionState === 'denied'
                                ? 'Microphone access was blocked. Please enable it in your browser settings.'
                                : 'We need your microphone to start. Please allow microphone access.'}
                        </p>
                        <button
                            className="px-4 py-2 bg-white text-primary rounded-lg font-semibold"
                            onClick={async () => {
                                setShowPermissionModal(false);
                                getLocalStream();
                            }}
                        >
                            {permissionState === 'denied' ? 'Open Settings' : 'Retry'}
                        </button>
                    </div>
                </div>
            )}

            <section className="flex flex-col h-[70vh]">
                <div className="flex gap-8 max-sm:flex-col">
                    {/* Companion UI */}
                    <div className="companion-section">
                        <div className="companion-avatar" style={{ backgroundColor: getSubjectColor(subject) }}>
                            <div className={cn(
                                'absolute transition-opacity duration-1000',
                                callStatus !== CallStatus.ACTIVE ? 'opacity-100' : 'opacity-0',
                                callStatus === CallStatus.CONNECTING && 'animate-pulse'
                            )}>
                                <Image src={`/icons/${subject}.svg`} alt={subject} width={150} height={150} />
                            </div>
                            <div className={cn(
                                'absolute transition-opacity duration-1000',
                                callStatus === CallStatus.ACTIVE ? 'opacity-100':'opacity-0'
                            )}>
                                <Lottie lottieRef={lottieRef} animationData={soundwaves} autoplay={false} className="companion-lottie"/>
                            </div>
                        </div>
                        <p className="font-bold text-2xl mt-4">{name}</p>
                    </div>

                    {/* User Controls */}
                    <div className="user-section">
                        <div className="user-avatar flex flex-col items-center">
                            <Image src={userImage} alt={userName} width={130} height={130} className="rounded-lg" />
                            <p className="font-bold text-2xl mt-2">{userName}</p>
                        </div>
                        <button className="btn-mic mt-4" onClick={toggleMic} disabled={callStatus !== CallStatus.ACTIVE}>
                            <Image src={isMuted ? '/icons/mic-off.svg':'/icons/mic-on.svg'} alt="mic" width={36} height={36}/>
                            <p className="max-sm:hidden">{isMuted ? 'Turn on microphone':'Turn off microphone'}</p>
                        </button>
                        <button
                            className={cn(
                                'rounded-lg py-3 mt-4 w-full text-white font-semibold',
                                callStatus === CallStatus.ACTIVE ? 'bg-red-700':'bg-primary',
                                callStatus === CallStatus.CONNECTING && 'animate-pulse'
                            )}
                            onClick={callStatus === CallStatus.ACTIVE ? handleDisconnect : handleCall}
                        >
                            {callStatus === CallStatus.ACTIVE
                                ? 'End Session'
                                : callStatus === CallStatus.CONNECTING
                                    ? 'Connecting'
                                    : 'Start Session'
                            }
                        </button>
                    </div>
                </div>

                {/* Transcript */}
                <div className="transcript mt-6 px-4 space-y-2 no-scrollbar">
                    {messages.map((msg, idx) => (
                        msg.role === 'assistant' ? (
                            <p key={idx} className="max-sm:text-sm">
                                <strong>{name.split(' ')[0]}:</strong> {msg.content}
                            </p>
                        ) : (
                            <p key={idx} className="text-primary max-sm:text-sm">
                                <strong>{userName}:</strong> {msg.content}
                            </p>
                        )
                    ))}
                </div>
                <div className="transcript-fade" />
            </section>
        </>
    );
};

export default CompanionComponent;
