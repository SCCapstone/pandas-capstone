import React from 'react';
import './Network.css';


interface NetworkTabsContainerProps {
    activeTab: string;
    setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

const NetworkTabsContainer: React.FC<NetworkTabsContainerProps> = ({ activeTab, setActiveTab }) => {
    return (
        <div className="NetworkTabsContainer">
            <button
                className={`Tab ${activeTab === "matches" ? "active" : ""}`}
                onClick={() => setActiveTab("matches")}
            >
                Connections
            </button>

            <button
                className={`Tab ${activeTab === "sentRequests" ? "active" : ""}`}
                onClick={() => setActiveTab("sentRequests")}
            >
                Requests Sent
            </button>

            <button
                className={`Tab ${activeTab === "receivedRequests" ? "active" : ""}`}
                onClick={() => setActiveTab("receivedRequests")}
            >
                Requests Received
            </button>
        </div>
    );
};

export default NetworkTabsContainer;
