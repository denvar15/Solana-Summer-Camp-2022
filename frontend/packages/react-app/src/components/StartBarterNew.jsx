import { Button, message, Steps, Card,  Input, DatePicker, Space } from 'antd';
import React, { useState } from 'react';
import genoImg from "../img/page-fg--hero.png";
const { Step } = Steps;
const { Meta } = Card;
const gridStyle = {
    width: '15%',
    textAlign: 'center',
  };
const steps = [
  {
    title: 'Select your NFT',
    id: 'one'
  },
  {
    title: 'Choose NFT you want',
    id: 'two'
  },
  {
    title: 'Change!',
    id: 'three'
  },
];
const genopets = {
    pets: [
      {
        "id": 2,
        "name": "Genesis Genopet #692",
        "img": "https://arweave.net/lkmOz4mfUftDO58iGWiCuDhJlQuhf_cwShROmtes4A4?ext=gif",
        "owner": "FZ7NMqDhFfyiJgrxNdj8eShNJNrZQmhCd76Ks2p6siKU",
        "address": "7FQ7W1rVmmG6n2DuDgx9eUyVKxJSK9wuXe8tATGYCCFd",
        "description": "Genesis Genopet #692 is a natural-born, go-getting leader that values empathy and compassion. It understands the nuances and ups and downs in the treacherous lands beyond the Veil but revels in the unpredictability of circumstance. It enjoys great delight in the sights and sounds of Esoterra and wants nothing more than to explore its depths with its friends.",
        "price": null,
        "collectionId": 1,
        "collection": {
          "id": 1,
          "name": "Genopets",
          "img": "https://data.solanart.io/img/collections/genopetspreview.webp",
          "solanartLink": "https://solanart.io/collections/genopets",
          "description": "Genopets is the world`s first move-to-earn NFT Game. Genesis Genopets are a playable collection of 3,333 limited-edition, pre-evolved Stage 4 Genopets, and the only ones that will ever exist with a Genesis marking. The Genoverse awaits.",
          "volumeTraded": 3074000
        }
        
      },
      {
        "id": 3,
        "name": "Genesis Genopet #692",
        "img": "https://arweave.net/lkmOz4mfUftDO58iGWiCuDhJlQuhf_cwShROmtes4A4?ext=gif",
        "owner": "FZ7NMqDhFfyiJgrxNdj8eShNJNrZQmhCd76Ks2p6siKU",
        "address": "7FQ7W1rVmmG6n2DuDgx9eUyVKxJSK9wuXe8tATGYCCFd",
        "description": "Genesis Genopet #692 is a natural-born, go-getting leader that values empathy and compassion. It understands the nuances and ups and downs in the treacherous lands beyond the Veil but revels in the unpredictability of circumstance. It enjoys great delight in the sights and sounds of Esoterra and wants nothing more than to explore its depths with its friends.",
        "price": null,
        "collectionId": 1,
        "collection": {
          "id": 1,
          "name": "Genopets",
          "img": "https://data.solanart.io/img/collections/genopetspreview.webp",
          "solanartLink": "https://solanart.io/collections/genopets",
          "description": "Genopets is the world`s first move-to-earn NFT Game. Genesis Genopets are a playable collection of 3,333 limited-edition, pre-evolved Stage 4 Genopets, and the only ones that will ever exist with a Genesis marking. The Genoverse awaits.",
          "volumeTraded": 3074000
        }
        
      }
    ]
  
  }



const ChangeTime = (date, dateString) => {
    console.log(date, dateString);
  };

const StartBarterNew = () => {
    
  const [current, setCurrent] = useState(0);

  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  return (
    <>
      <Steps current={current}>
        {steps.map((item) => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>
      <div className="steps-content">
          
            {(() => {
        switch (steps[current].id) {
          case "one":   return (
            <div id="one">
                <br />
                   {genopets.pets.map((obj) => (
                              <Card.Grid
                              key={obj.id}
                              style={gridStyle}
                              title={obj.name} 
                              > 
                               <img src={obj.img} width="72" height="72" />
                               <Meta title={obj.name} description={obj.description.slice(0, 10)}/>
                              </Card.Grid>
                            ))}
            </div>
          );
          case "two": return (
            <div id="two">
                <br />
                   {genopets.pets.map((obj) => (
                              <Card.Grid
                              key={obj.id}
                              style={gridStyle}
                              title={obj.name} 
                              > 
                               <img src={obj.img} width="72" height="72" />
                               <Meta title={obj.name} description={obj.description.slice(0, 10)}/>
                              </Card.Grid>
                            ))} 
            </div> 
          );
          case "three":  return (
            <div id="three">

                <Card
                    className="mynft text-start"
                    style={{
                      background: `url(${genoImg})`,
                      backgroundPosition: "contain",
                      height: 220,
                    }}
                  >
                    <div className="mynft__text">
                      <h2 className="text-start">Select NFT Freeze Time</h2>
                      <small className="text-start">This is necessary to guarantee the exchange for other users</small>
                      <div className="mt-3 text-center">
                        <Space direction="vertical">
                            <DatePicker onChange={ChangeTime} />
                        </Space>
                        <br /><br />
                        <Button type="primary">
                          Начать обмен
                        </Button>
                      </div>
                    </div>

                    <div className="mynft__bg-overlay" />
                  </Card>

            </div>
          );
          default:      return (
          <div>error</div>
          );
            }
        })()}
      
      </div>
      <div className="steps-action">
        {current < steps.length - 1 && (
          <Button type="primary" onClick={() => next()}>
            Next
          </Button>
        )}
        {current === steps.length - 1 && (
          <Button type="primary" onClick={() => message.success('Processing complete!')}>
            Done
          </Button>
        )}
        {current > 0 && (
          <Button
            style={{
              margin: '0 8px',
            }}
            onClick={() => prev()}
          >
            Previous
          </Button>
        )}
      </div>
    </>
  );
};

export default StartBarterNew;
