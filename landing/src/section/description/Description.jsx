import React, { useState, useEffect } from 'react';
import './style.css'


export const Description = () => {
    const [isDesktop, setIsDesktop] = useState(
        window.matchMedia("(min-width: 768px)").matches
    )

    useEffect(() => {
        window
            .matchMedia("(min-width: 768px)")
            .addEventListener('change', e => setIsDesktop(e.matches));
    }, []);

    return (
        <div className='pageDescription'>
            <div className='description'>
                <div className='descriptionTitle'>CryptoSteam</div>
                <div className='descriptionText'><p>CryptoSteam - это новая веха в развитии GameFI.</p><p>CryptoSteam представляет собой площадку, на которой есть всё, что нужно для игр в блокчейне. Новичок получит на площадке лёгкий вход в игры за счёт механизмов аренды игровых NFT, быстро найдёт тут друзей и единомышленников. Компоненты социализации, такие как ачивки, статусы, мессенждеры и wiki, помогут быстро адаптироваться в любой игре.</p><p>Опытный игрок получит возможность обменять имеющиеся у него NFT, предложив комьюнити на обмен собственные NFT.</p><p>Гильдия сможет набрать новых участников, обеспечив им прокачку с первой минуты игры, предоставив им в аренду топовые NFT.</p><p>Разработчики игр расширяют охват за счёт концентрации их целевой аудитории на площадке.</p></div>
            </div>
        </div>
    )
}
