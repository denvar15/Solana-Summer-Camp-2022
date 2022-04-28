import React, { useState } from "react";
import "./style.css";

export const Subscribe = () => {
  const [message, setMessage] = useState("")

  const handleSend = () => {
    setMessage("Заявка принята. Мы скоро с вами свяжемся")
  }

  return (
    <div className="pageSubscribe">
      <div className="subscribe">
        <div className="subscribeTitle">Оставить заявку на тестирование</div>
        <input type='text' placeholder="user@site.com" className="subscribeInput"/>
        <button className="subscribeButton" onClick={handleSend}>Отправить</button>
        <div className="subscribeMessage">{message}</div>
      </div>
    </div>
  );
};
