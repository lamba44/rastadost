import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import UserLogin from "./Pages/UserLogin/UserLogin";
import DriverLogin from "./Pages/DriverLogin/DriverLogin";
import User from "./Pages/User/User";
import Driver from "./Pages/Driver/Driver";

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/userlogin" element={<UserLogin />} />
                <Route path="/driverlogin" element={<DriverLogin />} />
                <Route path="/user" element={<User />} />
                <Route path="/driver" element={<Driver />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;
