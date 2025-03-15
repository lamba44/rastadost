import React from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";

const App = () => {
    const navigate = useNavigate();

    return (
        <div className="mainbg">
            <div className="phoneview home-container">
                <h1 className="home-title">Welcome to RastaDost</h1>
                <div className="button-group">
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
