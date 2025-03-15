import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./DriverLogin.css";
import googleLogo from "./../../assets/google.png";
import metaLogo from "./../../assets/meta.png";
import appleLogo from "./../../assets/apple.png";
import hideEye from "./../../assets/hideEye.png";
import showEye from "./../../assets/showEye.png";

const DriverLogin = () => {
    const navigate = useNavigate();

    const [authMode, setAuthMode] = useState("login");

    // Login fields
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Register fields
    const [username, setUsername] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Password visibility
    const [showPassword, setShowPassword] = useState(false);

    // Success/error states
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const isLogin = authMode === "login";

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isLogin) {
            // Dummy credentials: sample@mail.com and 12345
            if (email === "sample@mail.com" && password === "12345") {
                setIsSuccess(true);
                setErrorMsg("");
            } else {
                setIsSuccess(false);
                setErrorMsg("Invalid credentials!");
            }
        } else {
            alert("Register flow triggered. Implement as needed!");
        }
    };

    // On successful login, redirect after 4 seconds
    useEffect(() => {
        let timer;
        if (isSuccess) {
            timer = setTimeout(() => {
                navigate("/user");
            }, 4000);
        }
        return () => clearTimeout(timer);
    }, [isSuccess, navigate]);

    return (
        <div className="mainbg">
            <div className="phoneview userlogin-container">
                <form className="auth-form" onSubmit={handleSubmit}>
                    <h2 className="auth-title">
                        {isLogin
                            ? "Welcome back! Glad to see you, again!"
                            : "Hello! Register to get started"}
                    </h2>

                    {isLogin && isSuccess ? (
                        <div className="success-text">Success!</div>
                    ) : (
                        <>
                            {isLogin && errorMsg && (
                                <div className="error-message">{errorMsg}</div>
                            )}

                            {isLogin ? (
                                <>
                                    <div className="input-wrapper">
                                        <label
                                            htmlFor="email"
                                            className="input-label"
                                        >
                                            Email
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            placeholder="Enter your email"
                                            className="auth-input"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            required
                                            disabled={isSuccess}
                                        />
                                    </div>

                                    <div className="input-wrapper">
                                        <label
                                            htmlFor="password"
                                            className="input-label"
                                        >
                                            Password
                                        </label>
                                        <div className="password-field">
                                            <input
                                                id="password"
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                placeholder="Enter your password"
                                                className="auth-input"
                                                value={password}
                                                onChange={(e) =>
                                                    setPassword(e.target.value)
                                                }
                                                required
                                                disabled={isSuccess}
                                            />
                                            <button
                                                type="button"
                                                className="toggle-pw-btn"
                                                onClick={
                                                    togglePasswordVisibility
                                                }
                                                disabled={isSuccess}
                                            >
                                                <img
                                                    src={
                                                        showPassword
                                                            ? showEye
                                                            : hideEye
                                                    }
                                                    alt={
                                                        showPassword
                                                            ? "Hide password"
                                                            : "Show password"
                                                    }
                                                    className="toggle-pw-icon"
                                                />
                                            </button>
                                        </div>
                                        <div className="forgot-pw">
                                            Forgot Password?
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="auth-button"
                                    >
                                        Login
                                    </button>

                                    <div className="social-row">
                                        <div className="social-icon">
                                            <img src={googleLogo} alt="" />
                                        </div>
                                        <div className="social-icon">
                                            <img src={metaLogo} alt="" />
                                        </div>
                                        <div className="social-icon">
                                            <img src={appleLogo} alt="" />
                                        </div>
                                    </div>

                                    <div className="switch-auth">
                                        Don’t have an account?{" "}
                                        <span
                                            className="switch-link"
                                            onClick={() => {
                                                setAuthMode("register");
                                                setErrorMsg("");
                                            }}
                                        >
                                            Register Now
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        className="go-back-btn"
                                        onClick={() => navigate("/")}
                                    >
                                        Go Back
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="input-wrapper">
                                        <label
                                            htmlFor="username"
                                            className="input-label"
                                        >
                                            Username
                                        </label>
                                        <input
                                            id="username"
                                            type="text"
                                            placeholder="Enter your username"
                                            className="auth-input"
                                            value={username}
                                            onChange={(e) =>
                                                setUsername(e.target.value)
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="input-wrapper">
                                        <label
                                            htmlFor="email"
                                            className="input-label"
                                        >
                                            Email
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            placeholder="Enter your email"
                                            className="auth-input"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="input-wrapper">
                                        <label
                                            htmlFor="password"
                                            className="input-label"
                                        >
                                            Password
                                        </label>
                                        <input
                                            id="password"
                                            type="password"
                                            placeholder="Enter your password"
                                            className="auth-input"
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="input-wrapper">
                                        <label
                                            htmlFor="confirmPassword"
                                            className="input-label"
                                        >
                                            Confirm password
                                        </label>
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="Confirm your password"
                                            className="auth-input"
                                            value={confirmPassword}
                                            onChange={(e) =>
                                                setConfirmPassword(
                                                    e.target.value
                                                )
                                            }
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="auth-button"
                                    >
                                        Register
                                    </button>

                                    <div className="social-row">
                                        <div className="social-icon">
                                            <img src={googleLogo} alt="" />
                                        </div>
                                        <div className="social-icon">
                                            <img src={metaLogo} alt="" />
                                        </div>
                                        <div className="social-icon">
                                            <img src={appleLogo} alt="" />
                                        </div>
                                    </div>

                                    <div className="switch-auth">
                                        Already have an account?{" "}
                                        <span
                                            className="switch-link"
                                            onClick={() => setAuthMode("login")}
                                        >
                                            Login Now
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        className="go-back-btn"
                                        onClick={() => navigate("/")}
                                    >
                                        Go Back
                                    </button>
                                </>
                            )}
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default DriverLogin;
