import React from 'react';
import { TeamCard } from './TeamCard';
export const Team = () =>  {
    return (
        <div className='pageTeam'>
        <div className='team'>
            <div className='teamTitle'>Наша команда</div>
            <TeamCard name="Григорий Ситников" telegram="gesitnikov" />
            <TeamCard name="Артем Тарасов" telegram="artrsv" />
            <TeamCard name="Денис Сучков" telegram="denvar15" />
            <TeamCard name="Руслан Хайруллин" telegram="ruha02" />
        </div>
        </div>
    )
}
