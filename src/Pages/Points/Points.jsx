import React from "react";
import "./Points.css";

const Points = () => {
    //Sample Data
    const averageTripEarning = 160; // in rupees
    const monthlyEarning = 48000; // in rupees
    const points = 9000;
    const rating = 5; // out of 5

    const bonusPercent = (points / 10000) * (rating / 2);
    const bonusCash = (bonusPercent / 100) * monthlyEarning;

    return (
        <div className="mainbg">
            <div className="phoneview">
                <div className="points-container">
                    <div className="earning-data">
                        <div className="data-item">
                            <span className="label">Average Trip Earning:</span>
                            <span className="value">₹{averageTripEarning}</span>
                        </div>
                        <div className="data-item">
                            <span className="label">Monthly Earning:</span>
                            <span className="value">₹{monthlyEarning}</span>
                        </div>
                        <div className="data-item">
                            <span className="label">Points Accumulated:</span>
                            <span className="value">{points}</span>
                        </div>
                    </div>
                    <div className="bonus-section">
                        <h2>Bonus Calculation</h2>
                        <p className="calculation">
                            Formula: [ (points / 10000) × (rating / 2) ]% of
                            monthly earning
                        </p>
                        <p className="calculation">
                            Calculation: [ ({points} / 10000) × ({rating} / 2)
                            ]% = {bonusPercent.toFixed(2)}%
                        </p>
                        <p className="calculation">
                            Bonus: {bonusPercent.toFixed(2)}% of ₹
                            {monthlyEarning} = ₹{bonusCash.toFixed(2)}
                        </p>
                        <div className="bonus-highlight">
                            Bonus Cash: ₹{bonusCash.toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Points;
