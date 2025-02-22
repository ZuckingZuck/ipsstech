import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux"
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import NotFound from "../pages/NotFound";
import AdvertDetail from "../pages/AdvertDetail";
import Profile from "../pages/Profile";
import MyTeams from "../pages/MyTeams";
import MyMemberships from "../pages/MyMemberships";
import MyAdverts from "../pages/MyAdverts";
import AddAdvert from "../pages/AddAdvert";
import MyAdvertDetail from "../pages/MyAdvertDetail";
const AppRouter = () => {
    const user = useSelector((state) => state.user.user)
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/advert/:id" element={<AdvertDetail />} />
      <Route path="/me" element={user ? <Profile /> : <Navigate to="/login"/> } />
      <Route path="/me/teams" element={user ? <MyTeams /> : <Navigate to="/login"/> } />
      <Route path="/me/memberships" element={user ? <MyMemberships /> : <Navigate to="/login"/> } />
      <Route path="/me/adverts" element={user ? <MyAdverts /> : <Navigate to="/login"/> } />
      <Route path="/me/adverts/:id" element={user ? <MyAdvertDetail /> : <Navigate to="/login"/> } />
      <Route path="/me/adverts/add" element={user ? <AddAdvert /> : <Navigate to="/login"/> } />
      <Route path="/login" element={user ? <Navigate to="/"/> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/"/> : <Register />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
