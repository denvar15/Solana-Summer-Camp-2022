import React from 'react'
import { Sidebar, StartBarterNew } from "./index";
import { Layout, Menu, Breadcrumb, Row, Col, Card, Button, Badge, Input, List } from "antd";
import { Link } from "react-router-dom";
import "../bootstrap-utilites.css";

const { Header, Content, Sider } = Layout;
const { Meta } = Card;

function Home() {

    return(
        <div>

                <Layout>
                    <Layout style={{ padding: "0 24px 24px" }}>
                        <h2 className='mt-5 '>Start exchange now</h2>
                        <Content
                        className="site-layout-background"
                        style={{
                            padding: 24,
                            margin: 0,
                            minHeight: 280,
                        }}
                        >
                            <Row>
                                <Col span={8} className="mt-3">
                                    <Link to="genopets">
                                        <Card
                                        hoverable
                                        style={{ width: 240 }}
                                        cover={<img alt="game_name" src="https://i.imgur.com/vErJxbJ.png" />}
                                        >
                                            <Meta title="Genopets" description="Available NOW" />
                                        </Card>
                                    </Link>
                                </Col>
                                <Col span={8} className="mt-3">
                                    <Card
                                     hoverable
                                     style={{ width: 240 }}

                                     cover={<img alt="game_name" src="https://icodrops.com/wp-content/uploads/2021/09/DeFi_Land_logo.jpeg" />}
                                    >
                                        <Meta title="Defi Land" description="Coming Soon" />
                                        <div className='mute'></div>
                                    </Card>

                                </Col>
                                <Col span={8} className="mt-3">
                                    <Card
                                     hoverable
                                     style={{ width: 240 }}
                                     cover={<img alt="game_name" src="https://media-exp1.licdn.com/dms/image/C4E0BAQEmdyShvm9xLQ/company-logo_200_200/0/1610687223742?e=1668038400&v=beta&t=k1kQfgGC_r34sLnTjyQ5B0Ed4XpeghF7kPEVZuKDUjs" />}
                                    >
                                        <Meta title="Star Atlas" description="Coming Soon" />
                                        <div className='mute'></div>
                                    </Card>
                                </Col>
                                <Col span={8} className="mt-3">
                                    <Card
                                     hoverable
                                     style={{ width: 240 }}
                                     cover={<img alt="game_name" src="https://www.solchicks.io/wp-content/uploads/2021/10/solchicks-og-512-copy.jpg" />}
                                    >
                                        <Meta title="Solchicks" description="Coming Soon" />
                                        <div className='mute'></div>
                                    </Card>
                                </Col>
                                <Col span={8} className="mt-3">
                                    <Card
                                     hoverable
                                     style={{ width: 240 }}
                                     cover={<img alt="game_name" src="https://uploads-ssl.webflow.com/616d8cf9ec276c1e79adbb20/617749c78a0e58660ac13e40_dp36.png" />}
                                    >
                                        <Meta title="Zoolana" description="Coming Soon" />
                                        <div className='mute'></div>
                                    </Card>
                                </Col>
                                <Col span={8} className="mt-3">
                                    <Card
                                     hoverable
                                     style={{ width: 240 }}
                                     cover={<img alt="game_name" src="data:image/png;base64,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" />}
                                    >
                                        <Meta title="Void" description="Coming Soon" />
                                        <div className='mute'></div>
                                    </Card>
                                </Col>
                            </Row>
                        </Content>
                    </Layout>
                </Layout>

        </div>
    )
}
export default Home