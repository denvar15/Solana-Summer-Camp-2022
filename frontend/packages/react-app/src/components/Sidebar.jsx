import React, { useCallback, useEffect, useState } from 'react'
import { Layout, Menu, Breadcrumb, Row, Col, Card, Button, Badge } from 'antd';
import { WechatOutlined, MoneyCollectOutlined, ProfileOutlined, AliwangwangOutlined, HomeOutlined } from '@ant-design/icons';
import { Link } from "react-router-dom";
const { SubMenu } = Menu;
const { Sider } = Layout;


const Sidebar = () => {

    return (
        <Sider width={300} className="site-layout-background">
        <Menu
          mode="inline"
          defaultSelectedKeys={['1']}
          defaultOpenKeys={['sub1']}
          style={{ height: '100%', borderRight: 0 }}
        >
        <Menu.Item 
          key="2"
          icon={<HomeOutlined />}
        >
          <Link to="/">Home</Link>
          </Menu.Item>
        <SubMenu 
        key="sub33"
        icon={<MoneyCollectOutlined />} 
        title = {<span>Barter</span>}
        >
          <Menu.Item key="31"><Link
              to="/"
            >
              Start Barter
            </Link>
          </Menu.Item>
          <Menu.Item key="32"><Link
              to="active_offers"
            >
              Active Barter Offers
            </Link>
          </Menu.Item>
          <Menu.Item key="33"><Link
              to="approve_barter"
            >
             Approve Barter
            </Link>
          </Menu.Item>
          <Menu.Item key="34"><Link
              to="your_collectibles"
            >
            YourCollectibles
            </Link>
          </Menu.Item>

        </SubMenu>
        {/*
        <Menu.Item 
          key="1"
          icon={<ProfileOutlined/>}
        >
          Profile
    </Menu.Item> */}
        <Menu.Item 
          key="4"
          icon={<AliwangwangOutlined />} 
        >
          <Link to="AaveGotchi">AaveGotchi</Link>
        </Menu.Item>

        </Menu>
      </Sider>
    )
}

export default Sidebar