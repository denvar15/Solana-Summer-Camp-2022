import React from 'react'
import { Layout, Menu, Breadcrumb, Row, Col, Card, Button, Badge, List, Avatar, Space, Tabs } from 'antd';
import { Sidebar } from './../components'
import { WechatOutlined, MessageOutlined, LikeOutlined, StarOutlined, DoubleRightOutlined  } from '@ant-design/icons';
import { convertLegacyProps } from 'antd/lib/button/button';
const { Header, Content, Sider } = Layout;
const { TabPane } = Tabs;
const gridStyle = {
    width: '15%',
    textAlign: 'center',
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

const P2p = () => {
    return (
        <Layout id="gamePage">
        <Layout>
          <Sidebar />
          <Layout style={{ padding: '0 24px 24px' }}>
            <Content
              className="site-layout-background"
              style={{
                padding: 24,
                margin: 0,
                minHeight: 280,
              }}
            >
                <Tabs defaultActiveKey="3">
                    <TabPane tab="Ваши заявки на обмен" key="1">
                     Вы не создали ни одного предложения <br/>
                     <Button href="/" className="mt-3">Начать обмен</Button>
                    </TabPane>
                    <TabPane tab="Активные обмены" key="2">
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
                    </TabPane>
                    <TabPane tab="Биржа" key="3">
                    <List
                    itemLayout="vertical"
                    size="large"
                    pagination={{
                    onChange: page => {
                        console.log(page);
                    },
                    pageSize: 3,
                    }}
                   >
                        <List.Item
                          key="1"
                          extra={
                            <img
                              width={272}
                              alt="NFT to change"
                              src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png"
                            />
                          }
                        >
                          <List.Item.Meta
                            avatar={<Avatar src="" />}
                            title={<a href="">#1</a>}
                            description="Игра: Axie "
                            className='text-start'
                          />
                          <h3 className='text-start'>NFT к обмену</h3>
                            <Card.Grid
                              style={gridStyle}
                              title='Название NFT'
                            >
                                <img src='https://cdn.forbes.ru/forbes-static/1082x609/new/2021/12/75f-61c1f76ccde7d.webp' width="72" height="72" />
                              <Meta title='Название NFT'/>
                            </Card.Grid>
                        </List.Item>
                        <List.Item
                          key="2"
                          extra={
                            <img
                              width={272}
                              alt="NFT to change"
                              src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png"
                            />
                          }
                        >
                          <List.Item.Meta
                            avatar={<Avatar src="" />}
                            title={<a href="">#2</a>}
                            description="Игра: Axie "
                            className='text-start'
                          />
                          <h3 className='text-start'>NFT к обмену</h3>
                            <Card.Grid
                              style={gridStyle}
                              title='Название NFT'
                            >
                                <img src='https://cdn.forbes.ru/forbes-static/1082x609/new/2021/12/75f-61c1f76ccde7d.webp' width="72" height="72" />
                              <Meta title='0x03cb144b401139a96873836f8e9B12f013FdEcA9'/>
                            </Card.Grid>
                            <Card.Grid
                              style={gridStyle}
                              title='Название NFT'
                            >
                                <img src='https://cdn.forbes.ru/forbes-static/1082x609/new/2021/12/75f-61c1f76ccde7d.webp' width="72" height="72" />
                              <Meta title='0x03cb144b401139a96873836f8e9B12f013FdEcA9'/>
                            </Card.Grid>
                            <Card.Grid
                              style={gridStyle}
                              title='Название NFT'
                            >
                                <img src='https://cdn.forbes.ru/forbes-static/1082x609/new/2021/12/75f-61c1f76ccde7d.webp' width="72" height="72" />
                              <Meta title='0x03cb144b401139a96873836f8e9B12f013FdEcA9'/>
                            </Card.Grid>
                            <Card.Grid
                              style={gridStyle}
                              title='Название NFT'
                            >
                                <img src='https://cdn.forbes.ru/forbes-static/1082x609/new/2021/12/75f-61c1f76ccde7d.webp' width="72" height="72" />
                              <Meta title='0x03cb144b401139a96873836f8e9B12f013FdEcA9'/>
                            </Card.Grid>
                            <Card.Grid
                              style={gridStyle}
                              title='Название NFT'
                            >
                                <img src='https://cdn.forbes.ru/forbes-static/1082x609/new/2021/12/75f-61c1f76ccde7d.webp' width="72" height="72" />
                              <Meta title='0x03cb144b401139a96873836f8e9B12f013FdEcA9'/>
                            </Card.Grid>
                            <Card.Grid
                              style={gridStyle}
                              title='Название NFT'
                            >
                                <img src='https://cdn.forbes.ru/forbes-static/1082x609/new/2021/12/75f-61c1f76ccde7d.webp' width="72" height="72" />
                              <Meta title='0x03cb144b401139a96873836f8e9B12f013FdEcA9'/>
                            </Card.Grid>
                            <Card.Grid
                              style={gridStyle}
                              title='Название NFT'
                            >
                                <img src='https://cdn.forbes.ru/forbes-static/1082x609/new/2021/12/75f-61c1f76ccde7d.webp' width="72" height="72" />
                              <Meta title='0x03cb144b401139a96873836f8e9B12f013FdEcA9'/>
                            </Card.Grid>
                            <Card.Grid
                              style={gridStyle}
                              title='Название NFT'
                            >
                                <img src='https://cdn.forbes.ru/forbes-static/1082x609/new/2021/12/75f-61c1f76ccde7d.webp' width="72" height="72" />
                              <Meta title='0x03cb144b401139a96873836f8e9B12f013FdEcA9'/>
                            </Card.Grid>
                            <Card.Grid
                              style={gridStyle}
                              title='Название NFT'
                            >
                                <img src='https://cdn.forbes.ru/forbes-static/1082x609/new/2021/12/75f-61c1f76ccde7d.webp' width="72" height="72" />
                              <Meta title='0x03cb144b401139a96873836f8e9B12f013FdEcA9'/>
                            </Card.Grid>

                        </List.Item>
                     
                    </List>
                    </TabPane>
                </Tabs>
               
            </Content>
          </Layout>
        </Layout>
      </Layout>
    )
}

export default P2p