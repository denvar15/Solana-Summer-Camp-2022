import React, { useState } from "react";
import StatusAlert, { StatusAlertService } from 'react-status-alert';
import "./style.css";
import 'react-status-alert/dist/status-alert.css'


export const Subscribe = () => {
  const [alertId, setAlertId] = useState("")

  const handleSend = () => {
    const alert = StatusAlertService.showInfo('Заявка принята. Мы скоро с вами свяжемся')
    setAlertId(alert)
  }

  return (
    <div className="pageSubscribe">
      <StatusAlert />
      <div className="subscribe">
        <div className="subscribeTitle">Оставить заявку на тестирование</div>
        <div className="subscribeFormInput" >
          <input type='text' className="subscribeInput" placeholder="Email"  id='email' name='email' required />
          <label htmlFor='email' className="subscribeLabel">Email</label>
        </div>
        <button className="subscribeButton" onClick={handleSend}>Отправить</button>
      </div>
    </div>
  );
};
