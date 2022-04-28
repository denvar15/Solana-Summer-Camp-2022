import React from "react";
import { FeatureCard } from "./FeatureCard";
import "./style.css";

export const Features = () => {
  return (
    <div className="pageFeature">
      <div className="feature">
        <div className="featureTitle">Возможности CryptoSteam</div>
        <div className="featureList">
          <FeatureCard
            title="Личный кабинет"
            text={["кошельки", "игры", "гильдии", "NFT"]}
            image="https://cdn-icons-png.flaticon.com/512/79/79721.png"
          />
          <FeatureCard
            title="Социальная сеть"
            text={["месенджер","друзья", "достижения", "блоги/wiki", "стриминг"]}
            image="https://cdn-icons-png.flaticon.com/512/2919/2919936.png"
          />
          <FeatureCard
            title="P2P"
            text={["обмен игровыми NFT","межигровой обмен NFT","биржа"]}
            image="https://cdn-icons-png.flaticon.com/512/4492/4492014.png"
          />
          <FeatureCard
            title="Маркетплейс"
            text={["дистрибьюция игр", "продажа NFT", "аренда NFT"]}
            image="https://cdn-icons-png.flaticon.com/512/6615/6615937.png"
          />
        </div>
      </div>
    </div>
  );
};
