import React from 'react';
import './style.css';

export const RoadmapCard = ({ title, text }) => {
    return (
        <div class="roadmapCard">
        <div class="roadmapCardInfo">
          <h3 class="roadmapCardTitle">{title}</h3>
          <p>{text}</p>
        </div>
      </div>
    )
}
