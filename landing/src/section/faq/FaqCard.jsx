import React from 'react';
import './style.css';

export const FaqCard = ({ question, answer }) => {
    return (
        <div className="faqCard">
        <div className='faqQuestion'>{question}</div>
        <div className='faqAnswer'>{answer}</div>
        </div>
    )
}
