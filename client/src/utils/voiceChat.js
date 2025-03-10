export const createPeerConnection = () => {
  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }
    ]
  };

  return new RTCPeerConnection(configuration);
};

export const createAudioStream = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return stream;
  } catch (error) {
    console.error('Mikrofon erişimi alınamadı:', error);
    throw error;
  }
};

export const addStreamToPeerConnection = (peerConnection, stream) => {
  stream.getTracks().forEach(track => {
    peerConnection.addTrack(track, stream);
  });
};

export const createOffer = async (peerConnection) => {
  try {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    return offer;
  } catch (error) {
    console.error('Teklif oluşturulamadı:', error);
    throw error;
  }
};

export const handleAnswer = async (peerConnection, answer) => {
  try {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  } catch (error) {
    console.error('Cevap işlenemedi:', error);
    throw error;
  }
};

export const handleIceCandidate = async (peerConnection, candidate) => {
  try {
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (error) {
    console.error('ICE adayı eklenemedi:', error);
    throw error;
  }
};

export const cleanupPeerConnection = (peerConnection) => {
  if (peerConnection) {
    peerConnection.close();
  }
};

export const cleanupStream = (stream) => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
}; 