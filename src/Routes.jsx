import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import UserLogin from "./Pages/UserLogin/UserLogin";
import DriverLogin from "./Pages/DriverLogin/DriverLogin";
import User from "./Pages/User/User";
import Driver from "./Pages/Driver/Driver";
import DriverRide from "./Pages/DriverRide/DriverRide";
import Points from "./Pages/Points/Points";
import OverallTrips from "./Pages/OverallTrips/OverallTrips";
import UserRide from "./Pages/UserRide/UserRide";

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/userlogin" element={<UserLogin />} />
                <Route path="/driverlogin" element={<DriverLogin />} />
                <Route path="/user" element={<User />} />
                <Route path="/userride" element={<UserRide />} />
                <Route path="/driver" element={<Driver />} />
                <Route path="/driverride" element={<DriverRide />} />
                <Route path="/points" element={<Points />} />
                <Route path="/overalltrips" element={<OverallTrips />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;
