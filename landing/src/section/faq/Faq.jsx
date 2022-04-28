import React from 'react';
import { FaqCard } from './FaqCard';
export const Faq = () =>  {
    return (
        <div className='pageFaq'>
        <div className='faq'>
            <div className='faqTitle'>FAQ</div>
            <FaqCard question={"Question 1"} answer={"Answer1"} />
            <FaqCard question={"Question 2"} answer={"Answer2"} />
            <FaqCard question={"Question 3"} answer={"Answer3"} />
            <FaqCard question={"Question 4"} answer={"Answer4"} />
        </div>
        </div>
    )
}
