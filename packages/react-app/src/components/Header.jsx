import { PageHeader } from "antd";
import React from "react";
import bg_head from "../img/logo.aadda478.svg";
// displays a page header

export default function Header() {
  return (
    <a href="/" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="Crypto steam"
        subTitle="NFT Barter"
        style={{ cursor: "pointer", backgroundImage: `url(${bg_head})`, backgroundRepeat: 'no-repeat', backgroundPosition: 'center center', backgroundSize: '8%' }}
      />
    </a>
  );
}
