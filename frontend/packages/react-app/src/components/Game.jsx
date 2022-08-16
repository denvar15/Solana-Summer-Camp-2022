import React from 'react'
import { Layout, Menu, Breadcrumb, Row, Col, Card, Button, Badge, List, Avatar, Space, Tabs } from 'antd';
import { Sidebar } from './../components'
import axios from 'axios'
import { WechatOutlined, MessageOutlined, LikeOutlined, StarOutlined, DoubleRightOutlined  } from '@ant-design/icons';
import { convertLegacyProps } from 'antd/lib/button/button';
import { Link } from 'react-router-dom'
import bgimg from "../img/page-fg--hero.png";
const { Header, Content, Sider } = Layout;
const { TabPane } = Tabs;
const gridStyle = {
    width: '24%',
    textAlign: 'left',
  };
const gridStyleOffer = {
    width: '25%',
    textAligh: 'left'
}
const listData = [];
const IconText = ({ icon, text }) => (
    <Space>
      {React.createElement(icon)}
      {text}
    </Space>
  );
const { Meta } = Card;

const Game = () => {

  const [collection, setCollection] = React.useState([])
  const [list, setList] = React.useState([])
  const [isLoading, setIsLoading] = React.useState(true)  
  React.useEffect(() => {
    async function getData() {
        try {
            const [collectionResponse, listResponse] = await Promise.all([
                axios.get('http://94.228.122.16:8080/collection'),
                axios.get('http://94.228.122.16:8080/collection/list'),
            ])
            setIsLoading(false)
            setCollection(collectionResponse.data)
            setList(listResponse.data)

        } catch (error) {
            console.log('Ошибка при запросе данных ;(')
            console.error(error)
        }
    }
    getData()
}, [])

    return (
        <Layout id="gamePage">
        <Layout>
          <Sidebar />
          <Layout style={{ padding: '0 24px 24px', backgroundImage: `url(${bgimg})`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right bottom', backgroundSize: '25%'}}>

              <Layout 
                className='game-cover'
                style={{

                }}
              >
                  <h1>Genopets</h1>
                  <p>The World's First Move-to-Earn NFT Game</p>
              </Layout>
            <Content
              className="site-layout-background"
              style={{
                padding: 24,
                margin: 0,
                minHeight: 280,
              }}
            >
                <Tabs defaultActiveKey="3">
                    {/*<TabPane tab="Your offers" key="1">
                     Вы не создали ни одного предложения <br/>
                     <Button href="/" className="mt-3">Начать обмен</Button>
                    </TabPane>
                    <TabPane tab="Active offers" key="2">
                        <Row className='text-center'>
                            Предложений пока нет =(
                        </Row>
                        <div className="site-card-wrapper">
                        <Row gutter={16}>
                        <Card.Grid
                            style={gridStyleOffer}
                            title='Название NFT'

                        >
                            <h3 className='text-start'>Обмен №123411</h3>
                            <Row  justify="start">
                                <Col flex="auto" className='inline-block text-start'>
                                        <div className='text-start d-inline'>
                                        <img width="100px" src="https://cdn.forbes.ru/forbes-static/1082x609/new/2021/12/75f-61c1f76ccde7d.webp" alt="" />
                                        </div>
                                        <div className='d-inline p-5'>
                                            <DoubleRightOutlined/>
                                        </div>
                                        <div className='text-start d-inline'>
                                        <img  width="100px" src="https://cdn.forbes.ru/forbes-static/1082x609/new/2021/12/75f-61c1f76ccde7d.webp" alt="" />
                                        </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col flex="auto" className='inline-block text-start mt-5'>
                                    <Button type="primary" className='me-3'>Принять</Button>
                                    <Button type="primary" danger >Отказаться</Button>
                                </Col>
                            </Row>
                        </Card.Grid>

                        <Card.Grid
                            style={gridStyleOffer}
                            title='Название NFT'
                        >
                            <h3 className='text-start'>Обмен №1234123</h3>
                            <Row  justify="start">
                                <Col flex="auto" className='inline-block text-start'>
                                        <div className='text-start d-inline'>
                                        <img width="100px" src="https://cdn.forbes.ru/forbes-static/1082x609/new/2021/12/75f-61c1f76ccde7d.webp" alt="" />
                                        </div>
                                        <div className='d-inline p-5'>
                                            <DoubleRightOutlined/>
                                        </div>
                                        <div className='text-start d-inline'>
                                        <img  width="100px" src="https://cdn.forbes.ru/forbes-static/1082x609/new/2021/12/75f-61c1f76ccde7d.webp" alt="" />
                                        </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col flex="auto" className='inline-block text-start mt-5'>
                                    <Button type="primary" className='me-3'>Принять</Button>
                                    <Button type="primary" danger >Отказаться</Button>
                                </Col>
                            </Row>
                        </Card.Grid>
                        </Row>
                        </div>
                            </TabPane> */}
                    <TabPane tab="Exchange" key="3">
                        <Row  justify="start">
                            <List
                            itemLayout="vertical"
                            size="large"
                            >
                            {list.map((obj) => (
                              <Link to={`/nft/${obj.address}`}>
                                <Card.Grid
                                key={obj.id}
                                style={gridStyle}
                                title={obj.name} 
                                > 
                                <img src={obj.img} width="150" height="150" />
                                <Meta title={obj.name} description={obj.description.slice(0, 10)}/>
                                </Card.Grid>
                              </Link>
                            ))}



                            </List>
                        </Row>
                    </TabPane>
                </Tabs>

            </Content>
          </Layout>
        </Layout>
      </Layout>
    )
}

export default Game