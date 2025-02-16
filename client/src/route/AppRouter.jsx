import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux"
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import NotFound from "../pages/NotFound";
import AdvertDetail from "../pages/AdvertDetail";
const AppRouter = () => {
    const user = useSelector((state) => state.user.user)
  return (
    <Routes>
      <Route path="/" element={user ? <Home /> : <Navigate to="/login"/>} />
      <Route path="/advert/:id" element={user ? <AdvertDetail /> : <Navigate to="/login"/>} />
      <Route path="/login" element={user ? <Navigate to="/"/> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/"/> : <Register />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
