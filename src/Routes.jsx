import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import Login from "./Pages/Login/Login";
import UserView from "./Pages/UserView/UserView";
import DriverView from "./Pages/DriverView/DriverView";

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/login" element={<Login />} />
                <Route path="/user" element={<UserView />} />
                <Route path="/driver" element={<DriverView />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;
