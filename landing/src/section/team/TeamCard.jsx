import React from 'react';
import './style.css';

export const TeamCard = ({ name, telegram }) => {
    return (
        <div className="teamCard">
        <div className='teamName'>{name}</div>
        <div className='teamTelegram'><a href={"https://t.me/"+telegram} target="_blank">@{telegram}</a></div>
        </div>
    )
}
