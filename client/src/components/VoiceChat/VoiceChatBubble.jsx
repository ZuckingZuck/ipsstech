import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaMicrophone, FaMicrophoneSlash, FaUsers, FaTimes, FaVolumeUp } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';

const BubbleContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: linear-gradient(135deg, #1a1c1e 0%, #2c2f33 100%);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  padding: 16px;
  width: 300px;
  z-index: 1000;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transform: translateY(0);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Title = styled.h3`
  color: #fff;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #a0a0a0;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
`;

const ParticipantsList = styled.div`
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 12px;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }
`;

const Participant = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  margin-bottom: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7289da 0%, #5865f2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.$isSpeaking ? '#43b581' : '#a0a0a0'};
    border: 2px solid #2c2f33;
  }
`;

const ParticipantInfo = styled.div`
  flex: 1;
`;

const ParticipantName = styled.div`
  color: #fff;
  font-size: 14px;
  font-weight: 500;
`;

const ParticipantStatus = styled.div`
  color: #a0a0a0;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Controls = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const ControlButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  border: none;
  background: ${props => props.$isActive ? '#7289da' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.$isActive ? '#fff' : '#a0a0a0'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$isActive ? '#5b6eae' : 'rgba(255, 255, 255, 0.15)'};
  }
`;

const VoiceChatBubble = ({ socket, onClose }) => {
  const user = useSelector((state) => state.user.user);
  const [participants, setParticipants] = useState([
    {
      userId: user.user._id,
      name: user.user.name,
      surname: user.user.surname,
      isMuted: false,
      isSpeaking: false
    }
  ]);
  const [isMuted, setIsMuted] = useState(false);
  const [teamName, setTeamName] = useState('Takım Sohbeti');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const audioElementsRef = useRef({});
  const iceCandidateQueuesRef = useRef({});
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const javascriptNodeRef = useRef(null);

  // WebRTC yapılandırması
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' }
    ],
    iceCandidatePoolSize: 10,
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require'
  };

  useEffect(() => {
    console.log("VoiceChatBubble bileşeni yüklendi");
    console.log("Socket:", socket);
    console.log("TeamId:", socket?.teamId);
    
    // Takım adını al
    const fetchTeamName = async () => {
      try {
        if (!socket || !socket.teamId) {
          console.log("Socket veya teamId bulunamadı");
          setTeamName('Takım Sohbeti');
          return;
        }
        
        console.log("Takım adı alınıyor...", socket.teamId);
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/team/${socket.teamId}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`
            }
          }
        );
        setTeamName(response.data.name);
      } catch (error) {
        console.error('Takım adı alınamadı:', error);
        setTeamName('Takım Sohbeti');
      }
    };

    fetchTeamName();

    // WebRTC bağlantısını başlat
    const initWebRTC = async () => {
      try {
        // Mikrofon izni al
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        localStreamRef.current = stream;
        console.log("Mikrofon erişimi sağlandı");
        
        // Ses seviyesini kontrol et
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        const microphone = audioContextRef.current.createMediaStreamSource(stream);
        javascriptNodeRef.current = audioContextRef.current.createScriptProcessor(2048, 1, 1);
        
        analyserRef.current.smoothingTimeConstant = 0.8;
        analyserRef.current.fftSize = 1024;
        
        microphone.connect(analyserRef.current);
        analyserRef.current.connect(javascriptNodeRef.current);
        javascriptNodeRef.current.connect(audioContextRef.current.destination);
        
        javascriptNodeRef.current.onaudioprocess = () => {
          if (isMuted) return; // Mikrofon kapalıysa ses seviyesini kontrol etme
          
          const array = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(array);
          const values = array.reduce((a, b) => a + b, 0) / array.length;
          
          // Ses seviyesi eşiği
          const threshold = 30;
          const isSpeakingNow = values > threshold;
          
          if (isSpeakingNow !== isSpeaking) {
            setIsSpeaking(isSpeakingNow);
            
            // Sunucuya konuşma durumunu bildir
            if (socket) {
              socket.emit('voice_chat_speaking', {
                userId: user.user._id,
                isSpeaking: isSpeakingNow
              });
            }
          }
        };
        
        // Socket olaylarını dinle
        if (socket) {
          // Katılımcıları dinle
          socket.on('voice_chat_participants', (data) => {
            console.log('Katılımcılar güncellendi:', data);
            
            // Yeni katılımcılar için WebRTC bağlantısı oluştur
            const currentParticipantIds = participants.map(p => p.userId);
            const newParticipants = data.filter(p => 
              p.userId !== user.user._id && 
              !currentParticipantIds.includes(p.userId)
            );
            
            // Yeni katılımcılar için bağlantı oluştur ve teklif gönder
            newParticipants.forEach(participant => {
              const peerConnection = createPeerConnection(participant.userId);
              if (peerConnection) {
                createOffer(participant.userId, peerConnection);
              }
            });
            
            setParticipants(data);
          });
          
          // WebRTC sinyal olaylarını dinle
          socket.on('webrtc_offer', async (data) => {
            console.log('WebRTC teklifi alındı:', data);
            const { offer, fromUserId } = data;
            
            if (fromUserId !== user.user._id) {
              await handleOffer(fromUserId, offer);
            }
          });
          
          socket.on('webrtc_answer', async (data) => {
            console.log('WebRTC cevabı alındı:', data);
            const { answer, fromUserId } = data;
            
            if (fromUserId !== user.user._id) {
              await handleAnswer(fromUserId, answer);
            }
          });
          
          socket.on('webrtc_ice_candidate', async (data) => {
            console.log('ICE adayı alındı:', data);
            const { candidate, fromUserId } = data;
            
            if (fromUserId !== user.user._id) {
              await handleIceCandidate(fromUserId, candidate);
            }
          });
        }
        
      } catch (error) {
        console.error('WebRTC başlatma hatası:', error);
        toast.error('Mikrofon erişimi sağlanamadı');
      }
    };
    
    // WebRTC bağlantısı oluştur
    const createPeerConnection = (userId) => {
      try {
        console.log(`${userId} için peer bağlantısı oluşturuluyor`);
        
        // Eğer zaten bir bağlantı varsa, önce onu temizle
        if (peerConnectionsRef.current[userId]) {
          peerConnectionsRef.current[userId].close();
          delete peerConnectionsRef.current[userId];
        }
        
        // Yeni bağlantı oluştur
        const peerConnection = new RTCPeerConnection(rtcConfig);
        
        // Yerel ses akışını ekle
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStreamRef.current);
          });
        }
        
        // ICE adaylarını dinle
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            console.log(`ICE adayı bulundu: ${userId}`);
            socket.emit('webrtc_ice_candidate', {
              candidate: event.candidate,
              targetUserId: userId,
              fromUserId: user.user._id
            });
          }
        };
        
        // ICE bağlantı durumunu izle
        peerConnection.oniceconnectionstatechange = () => {
          console.log(`${userId} ICE bağlantı durumu:`, peerConnection.iceConnectionState);
          
          // Bağlantı koptuğunda yeniden bağlanmayı dene
          if (peerConnection.iceConnectionState === 'disconnected' || 
              peerConnection.iceConnectionState === 'failed') {
            console.log(`${userId} ile bağlantı koptu, yeniden bağlanılıyor...`);
            
            // Kısa bir süre bekleyip yeniden bağlanmayı dene
            setTimeout(() => {
              if (peerConnectionsRef.current[userId] === peerConnection) {
                createOffer(userId, peerConnection);
              }
            }, 2000);
          }
        };
        
        // Bağlantı durumunu izle
        peerConnection.onconnectionstatechange = () => {
          console.log(`${userId} bağlantı durumu:`, peerConnection.connectionState);
        };
        
        // Sinyal durumunu izle
        peerConnection.onsignalingstatechange = () => {
          console.log(`${userId} sinyal durumu:`, peerConnection.signalingState);
        };
        
        // Uzak ses akışını al
        peerConnection.ontrack = (event) => {
          console.log(`${userId}'den ses akışı alındı`);
          
          // Ses elementini oluştur veya güncelle
          let audioElement = audioElementsRef.current[userId];
          if (!audioElement) {
            audioElement = new Audio();
            audioElement.autoplay = true;
            audioElement.volume = 1.0;
            audioElementsRef.current[userId] = audioElement;
          }
          
          audioElement.srcObject = event.streams[0];
          
          // Sesi oynat
          const playPromise = audioElement.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.error('Ses oynatma hatası:', error);
              
              // Kullanıcı etkileşimi gerekiyorsa, otomatik oynatmayı devre dışı bırak
              if (error.name === 'NotAllowedError') {
                console.log('Otomatik oynatma engellendi, kullanıcı etkileşimi gerekiyor');
                
                // Kullanıcıya bilgi ver
                toast.info('Ses oynatmak için sayfaya tıklayın');
                
                // Sayfa tıklandığında sesi oynat
                const playAudio = () => {
                  audioElement.play().catch(e => console.error('Ses oynatma hatası:', e));
                  document.removeEventListener('click', playAudio);
                };
                document.addEventListener('click', playAudio);
              }
            });
          }
        };
        
        // Bağlantıyı kaydet
        peerConnectionsRef.current[userId] = peerConnection;
        
        return peerConnection;
      } catch (error) {
        console.error(`${userId} için peer bağlantısı oluşturma hatası:`, error);
        return null;
      }
    };
    
    // WebRTC teklifi oluştur
    const createOffer = async (userId, peerConnection) => {
      try {
        console.log(`${userId} için teklif oluşturuluyor`);
        
        // Teklif oluştur
        const offer = await peerConnection.createOffer();
        
        // Yerel açıklamayı ayarla
        await peerConnection.setLocalDescription(offer);
        
        // Teklifi gönder
        socket.emit('webrtc_offer', {
          offer,
          targetUserId: userId,
          fromUserId: user.user._id
        });
      } catch (error) {
        console.error(`${userId} için teklif oluşturma hatası:`, error);
      }
    };
    
    // WebRTC teklifini işle
    const handleOffer = async (userId, offer) => {
      try {
        console.log(`${userId}'den gelen teklif işleniyor`);
        
        // Bağlantı oluştur veya mevcut bağlantıyı al
        let peerConnection = peerConnectionsRef.current[userId];
        if (!peerConnection) {
          peerConnection = createPeerConnection(userId);
          if (!peerConnection) return;
        }
        
        // Eğer bağlantı zaten bir teklif veya cevap işliyorsa, işlemi iptal et
        if (peerConnection.signalingState !== 'stable') {
          console.log(`${userId} için bağlantı durumu uygun değil:`, peerConnection.signalingState);
          return;
        }
        
        // Uzak açıklamayı ayarla
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        
        // Cevap oluştur
        const answer = await peerConnection.createAnswer();
        
        // Yerel açıklamayı ayarla
        await peerConnection.setLocalDescription(answer);
        
        // Cevabı gönder
        socket.emit('webrtc_answer', {
          answer,
          targetUserId: userId,
          fromUserId: user.user._id
        });
        
        // Kuyruktaki ICE adaylarını ekle
        const iceCandidateQueue = iceCandidateQueuesRef.current[userId] || [];
        if (iceCandidateQueue.length > 0) {
          console.log(`${userId} için kuyruktaki ${iceCandidateQueue.length} ICE adayı ekleniyor`);
          for (const candidate of iceCandidateQueue) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          }
          iceCandidateQueuesRef.current[userId] = [];
        }
      } catch (error) {
        console.error(`${userId}'den gelen teklifi işleme hatası:`, error);
      }
    };
    
    // WebRTC cevabını işle
    const handleAnswer = async (userId, answer) => {
      try {
        console.log(`${userId}'den gelen cevap işleniyor`);
        
        const peerConnection = peerConnectionsRef.current[userId];
        if (!peerConnection) {
          console.log(`${userId} için peer bağlantısı bulunamadı`);
          return;
        }
        
        // Eğer bağlantı durumu uygun değilse, işlemi iptal et
        if (peerConnection.signalingState !== 'have-local-offer') {
          console.log(`${userId} için bağlantı durumu uygun değil:`, peerConnection.signalingState);
          return;
        }
        
        // Uzak açıklamayı ayarla
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        
        // Kuyruktaki ICE adaylarını ekle
        const iceCandidateQueue = iceCandidateQueuesRef.current[userId] || [];
        if (iceCandidateQueue.length > 0) {
          console.log(`${userId} için kuyruktaki ${iceCandidateQueue.length} ICE adayı ekleniyor`);
          for (const candidate of iceCandidateQueue) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          }
          iceCandidateQueuesRef.current[userId] = [];
        }
      } catch (error) {
        console.error(`${userId}'den gelen cevabı işleme hatası:`, error);
      }
    };
    
    // ICE adayını işle
    const handleIceCandidate = async (userId, candidate) => {
      try {
        console.log(`${userId}'den gelen ICE adayı işleniyor`);
        
        const peerConnection = peerConnectionsRef.current[userId];
        if (!peerConnection) {
          console.log(`${userId} için peer bağlantısı bulunamadı`);
          return;
        }
        
        // ICE adayını ekle
        if (peerConnection.remoteDescription) {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          console.log(`${userId} için ICE adayı eklendi`);
        } else {
          // Uzak açıklama henüz ayarlanmadıysa, ICE adayını kuyruğa ekle
          console.log(`${userId} için uzak açıklama henüz ayarlanmadı, ICE adayı kuyruğa ekleniyor`);
          if (!iceCandidateQueuesRef.current[userId]) {
            iceCandidateQueuesRef.current[userId] = [];
          }
          iceCandidateQueuesRef.current[userId].push(candidate);
        }
      } catch (error) {
        console.error(`${userId}'den gelen ICE adayını işleme hatası:`, error);
      }
    };

    initWebRTC();

    return () => {
      // Ses işleme kaynaklarını temizle
      if (javascriptNodeRef.current) {
        javascriptNodeRef.current.disconnect();
        javascriptNodeRef.current = null;
      }
      
      if (analyserRef.current) {
        analyserRef.current.disconnect();
        analyserRef.current = null;
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(e => console.error('Audio context kapatma hatası:', e));
        audioContextRef.current = null;
      }
      
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
      
      // Tüm WebRTC bağlantılarını kapat
      Object.values(peerConnectionsRef.current).forEach(pc => {
        if (pc) pc.close();
      });
      peerConnectionsRef.current = {};
      
      // Tüm ses elementlerini temizle
      Object.values(audioElementsRef.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.srcObject = null;
        }
      });
      audioElementsRef.current = {};
      
      // ICE aday kuyruklarını temizle
      iceCandidateQueuesRef.current = {};
      
      if (socket) {
        socket.off('voice_chat_participants');
        socket.off('webrtc_offer');
        socket.off('webrtc_answer');
        socket.off('webrtc_ice_candidate');
      }
    };
  }, [socket, user]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      // Sadece mikrofonu kapat/aç, bağlantıyı kapatma
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!isMuted);
      
      // Mikrofon durumunu sunucuya bildir
      if (socket) {
        socket.emit('voice_chat_mute', {
          userId: user.user._id,
          isMuted: !isMuted
        });
      }
      
      // Mikrofon kapalıysa konuşma durumunu da kapat
      if (!audioTrack.enabled && isSpeaking) {
        setIsSpeaking(false);
        if (socket) {
          socket.emit('voice_chat_speaking', {
            userId: user.user._id,
            isSpeaking: false
          });
        }
      }
      
      // Bildirim göster
      toast.info(audioTrack.enabled ? 'Mikrofon açıldı' : 'Mikrofon kapatıldı', {
        position: "bottom-center",
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const handleClose = () => {
    // Ses işleme kaynaklarını temizle
    if (javascriptNodeRef.current) {
      javascriptNodeRef.current.disconnect();
      javascriptNodeRef.current = null;
    }
    
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(e => console.error('Audio context kapatma hatası:', e));
      audioContextRef.current = null;
    }
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    // Tüm WebRTC bağlantılarını kapat
    Object.values(peerConnectionsRef.current).forEach(pc => {
      if (pc) pc.close();
    });
    peerConnectionsRef.current = {};
    
    // Tüm ses elementlerini temizle
    Object.values(audioElementsRef.current).forEach(audio => {
      if (audio) {
        audio.pause();
        audio.srcObject = null;
      }
    });
    audioElementsRef.current = {};
    
    // ICE aday kuyruklarını temizle
    iceCandidateQueuesRef.current = {};
    
    if (socket) {
      socket.emit('leave_voice_chat', { 
        userId: user.user._id,
        teamId: socket.teamId
      });
    }
    
    onClose();
  };

  return (
    <BubbleContainer>
      <Header>
        <Title>
          <FaUsers />
          {teamName}
        </Title>
        <CloseButton onClick={handleClose}>
          <FaTimes />
        </CloseButton>
      </Header>

      <ParticipantsList>
        {participants.map((participant) => (
          <Participant key={participant.userId}>
            <Avatar $isSpeaking={participant.isSpeaking}>
              {participant.name ? participant.name[0].toUpperCase() : '?'}
            </Avatar>
            <ParticipantInfo>
              <ParticipantName>
                {participant.name} {participant.surname}
              </ParticipantName>
              <ParticipantStatus>
                {participant.isMuted ? (
                  <>
                    <FaMicrophoneSlash />
                    Sessiz
                  </>
                ) : participant.isSpeaking ? (
                  <>
                    <FaVolumeUp />
                    Konuşuyor
                  </>
                ) : (
                  <>
                    <FaMicrophone />
                    Aktif
                  </>
                )}
              </ParticipantStatus>
            </ParticipantInfo>
          </Participant>
        ))}
      </ParticipantsList>

      <Controls>
        <ControlButton $isActive={!isMuted} onClick={toggleMute}>
          {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
          {isMuted ? 'Sessiz' : 'Konuşuyor'}
        </ControlButton>
      </Controls>
    </BubbleContainer>
  );
};

export default VoiceChatBubble; 