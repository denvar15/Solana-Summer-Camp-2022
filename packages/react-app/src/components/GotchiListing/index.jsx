import "./styles.css"
import React, { Component, useEffect, useState }  from 'react';

export const GotchiListing = ({ id, name, collateralColor, selected, selectGotchi }) => {
 return (
    <div className={`gotchi-listing ${selected && 'selected'}`} onClick={() => selectGotchi()}>
      <div className="collateral-container">
        <div className="collateral" style={{ backgroundColor: collateralColor }} />
      </div>
      <p className="id">{id}</p>
      <p className="name">{name}</p>
   </div>
 )
}