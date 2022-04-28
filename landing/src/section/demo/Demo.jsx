import React from "react";
import "./style.css";

export const Demo = () => {
  return (
    <div className="pageDemo">
      <div className="demo">
        <div className="demoTitle">Демонстрация CryptoSteam</div>
      </div>
      <div className="demoVideo">
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/suhJhY0OB2M"
          frameBorder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
        </div>
    </div>
  );
};
