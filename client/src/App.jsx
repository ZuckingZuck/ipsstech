import { BrowserRouter as Router } from "react-router-dom";
import AppRouter from "./route/AppRouter";
import Navbar from "./components/Navbar";
import { ToastContainer } from "react-toastify";
import axios from "axios";
import { useDispatch } from "react-redux";
import { fetchAdverts } from "./redux/advertSlice";
import { useEffect } from "react";
function App() {
  const dispatch = useDispatch();
  const GetAdverts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/api/advert`);
      if(response.status === 200){
        dispatch(fetchAdverts(response.data));
        console.log(response.data)
      }
    } catch (error) {
      console.log(error);
    }
  }


  useEffect(() => {
    GetAdverts();
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
