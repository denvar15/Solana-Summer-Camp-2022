import React from 'react';
import './style.css';

export const FeatureCard = ({ image, title, text }) => {
    return (
        <div className="featureCard">
            <img src={image} style={{ width: '50%', margin: '16px' }} />
            <div className="featureCardContainer">
                <><b>{title}</b><br/></>
                    {text.map((item, i) => {
                        return (<>{item}<br/></>)
                    })}
            </div>
        </div>
    )
}
