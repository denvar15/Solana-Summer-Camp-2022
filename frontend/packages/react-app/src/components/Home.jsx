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
            <Layout id="gamePage">
                <Layout>
                    <Sidebar />
                    <Layout style={{ padding: "0 24px 24px" }}>
                        <StartBarterNew/>
                        <h1 className='mt-5 '>Start exchange now</h1>
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
                                    <Link to="Game">
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
                                     cover={<img alt="game_name" src="https://fractal-media.imgix.net/media_00066e60-3aab-4346-9cfc-8e31c905cc3d?w=500&h=500&fit=crop&auto=format,compress&frame=1" />}
                                    >
                                        <Meta title="Million on Mars" description="Available NOW" />
                                    </Card>
                                </Col>
                                <Col span={8} className="mt-3">
                                    <Card
                                     hoverable
                                     style={{ width: 240 }}
                                     cover={<img alt="game_name" src="https://fractal-media.imgix.net/media_00066e60-3aab-4346-9cfc-8e31c905cc3d?w=500&h=500&fit=crop&auto=format,compress&frame=1" />}
                                    >
                                        <Meta title="Million on Mars" description="Available NOW" />
                                    </Card>
                                </Col>
                                <Col span={8} className="mt-3">
                                    <Card
                                     hoverable
                                     style={{ width: 240 }}
                                     cover={<img alt="game_name" src="https://fractal-media.imgix.net/media_00066e60-3aab-4346-9cfc-8e31c905cc3d?w=500&h=500&fit=crop&auto=format,compress&frame=1" />}
                                    >
                                        <Meta title="Million on Mars" description="Available NOW" />
                                    </Card>
                                </Col>
                                <Col span={8} className="mt-3">
                                    <Card
                                     hoverable
                                     style={{ width: 240 }}
                                     cover={<img alt="game_name" src="https://fractal-media.imgix.net/media_00066e60-3aab-4346-9cfc-8e31c905cc3d?w=500&h=500&fit=crop&auto=format,compress&frame=1" />}
                                    >
                                        <Meta title="Million on Mars" description="Available NOW" />
                                    </Card>
                                </Col>
                                <Col span={8} className="mt-3">
                                    <Card
                                     hoverable
                                     style={{ width: 240 }}
                                     cover={<img alt="game_name" src="https://fractal-media.imgix.net/media_00066e60-3aab-4346-9cfc-8e31c905cc3d?w=500&h=500&fit=crop&auto=format,compress&frame=1" />}
                                    >
                                        <Meta title="Million on Mars" description="Available NOW" />
                                    </Card>
                                </Col>
                            </Row>
                        </Content>
                    </Layout>
                </Layout>
            </Layout>
        </div>
    )
}
export default Home