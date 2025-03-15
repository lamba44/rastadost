import React from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
import mainLogo from "./assets/logo.png";

const App = () => {
    const navigate = useNavigate();

    return (
        <div className="mainbg">
            <div className="phoneview home-container">
                <img
                    src={mainLogo}
                    alt="RastaDost Logo"
                    className="home-logo fade-element fade-delay-1"
                />

                <h1 className="brand-name fade-element fade-delay-2">
                    RastaDost
                </h1>

                <div className="button-group fade-element fade-delay-3">
                    <button
                        className="login-button"
                        onClick={() => navigate("/userlogin")}
                    >
                        User Login
                    </button>
                    <button
                        className="login-button"
                        onClick={() => navigate("/driverlogin")}
                    >
                        Driver Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default App;
