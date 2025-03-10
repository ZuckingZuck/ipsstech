import { BrowserRouter as Router } from "react-router-dom";
import AppRouter from "./route/AppRouter";
import Navbar from "./components/Navbar";
import { ToastContainer } from "react-toastify";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdverts } from "./redux/advertSlice";
import { useEffect } from "react";
import { fetchLeds, fetchTeams } from "./redux/teamSlice";
import SocketProvider, { useSocket } from "./context/SocketContext";
import VoiceChatBubble from "./components/VoiceChat/VoiceChatBubble";

function AppContent() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const { socket, isInVoiceChat, setIsInVoiceChat } = useSocket();
  
  const GetAdverts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/api/advert`);
      if(response.status === 200){
        dispatch(fetchAdverts({ allAdverts: response.data, userId: user?.user._id }));
        console.log("adverts:",response.data)
      }
    } catch (error) {
      console.log(error);
    }
  }

  const GetTeams = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/api/team/myteams`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      if(response.status === 200){
        dispatch(fetchTeams(response.data));
        console.log(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const GetLeds = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/api/team/myleds`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      if(response.status === 200){
        dispatch(fetchLeds(response.data));
        console.log(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    GetAdverts();
    if (user) {
      GetTeams();
      GetLeds();
    }
  }, [user])

  // Sesli sohbet durumunu konsola yazdır
  useEffect(() => {
    console.log("Sesli sohbet durumu:", isInVoiceChat);
  }, [isInVoiceChat]);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        limit={3}
      />
      <Navbar />
      <AppRouter />
      {user?.user && socket && isInVoiceChat && (
        <VoiceChatBubble 
          socket={socket} 
          onClose={() => {
            console.log("VoiceChatBubble kapatılıyor");
            setIsInVoiceChat(false);
            if (socket) {
              socket.emit("leave_voice_chat", {
                teamId: socket.teamId,
                userId: user.user._id
              });
            }
          }}
        />
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </div>
    </Router>
  );
}

export default App;
