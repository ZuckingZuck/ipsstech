import { BrowserRouter as Router } from "react-router-dom";
import AppRouter from "./route/AppRouter";
import Navbar from "./components/Navbar";
import { ToastContainer } from "react-toastify";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdverts } from "./redux/advertSlice";
import { useEffect } from "react";
import { fetchLeds, fetchTeams } from "./redux/teamSlice";
function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  console.log("kullanıcıyım",user);
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
    GetTeams();
    GetLeds();
  }, [])
  return (
    <div className="App">
      <Router>
          <ToastContainer />
          <Navbar />
          <AppRouter />
      </Router>
    </div>
  );
}

export default App;
