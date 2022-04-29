import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { Description } from './section/description/Description';
import { Demo } from './section/demo/Demo'
import { Faq } from './section/faq/Faq'
import { Features } from './section/features/Features'
import { Roadmap } from './section/roadmap/Roadmap'
import { Team } from './section/team/Team'
import { Subscribe } from './section/subscribe/Subscribe';
import { YMInitializer } from 'react-yandex-metrika';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Description />
    <Demo />
    <Features />
    <Roadmap />
    <Subscribe />
    <Faq />
    <Team />
    <YMInitializer accounts={[88658034]} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
