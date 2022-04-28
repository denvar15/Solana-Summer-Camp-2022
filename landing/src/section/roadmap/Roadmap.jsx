import React from 'react';
import { RoadmapCard } from './RoadmapCard';
export const Roadmap = () => {
    return (
        <div className="pageFeature">
            <div className="roadmap">
                <div className="roadmapTitle">Roadmap</div>
                <div className="roadmapList">
                    <RoadmapCard
                        title="Q2 22 - Интеграция с маркетплейсами"
                        text="Площадка предоставляет удобные функции обмена, покупки и аналитики."
                    />
                    <RoadmapCard
                        title="Q3 22 - Интеграция с Axie Infinity"
                        text="Площадка предоставляет полноценные межсетевые обмены и средства для коммуникации гильдий. Интеграция с сетью Ronin, реализация взаимодействия со всей экосистемой Axie Infinity"
                    />
                    <RoadmapCard
                        title="Q4 22 - Реализация механизма аренды"
                        text="Площадка предоставляет p2p и b2b бартерные функции, привлекая крупные межсетевые гильдии. Добавление новых сетей. Снижение порога входа для новых игроков."
                    />
                    <RoadmapCard
                        title="Q1 23 - Интеграция с не EVM сетями"
                        text="Площадка обеспечивает бесшовное взаимодействие проектов из десятков разных сетей. Дальнейшее расширение доступности сервиса для игроков в других сетях"
                    />
                </div>
            </div>
        </div>
    )
}
