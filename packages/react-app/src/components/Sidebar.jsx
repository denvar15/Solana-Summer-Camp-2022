import React from 'react'
import { Layout, Menu, Breadcrumb, Row, Col, Card, Button, Badge } from 'antd';
import { WechatOutlined } from '@ant-design/icons';
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
            <Menu.Item key="1">Профиль</Menu.Item>
            <Menu.Item key="2">Инвентарь</Menu.Item>
            <Menu.Item key="3">Активность</Menu.Item>
            <Menu.Item key="4">Биржа</Menu.Item>
            
        <SubMenu 
        key="sub2" 
        icon={<WechatOutlined />} 
        title={<span>Друзья онлайн <Badge count={5} style={{ backgroundColor: '#868686' }} ></Badge></span>}
        
        >
            <Menu.Item key="5">dona</Menu.Item>
            <Menu.Item key="6">miki</Menu.Item>
            <Menu.Item key="7">raf</Menu.Item>
            <Menu.Item key="8">leo</Menu.Item>
          </SubMenu>
          <SubMenu 
        key="sub3" 
        icon={<WechatOutlined />} 
        title={<span>Активные обмены <Badge count={2} ></Badge></span>}
        
        >
            <Menu.Item key="5">dona</Menu.Item>
            <Menu.Item key="6">miki</Menu.Item>
            <Menu.Item key="7">raf</Menu.Item>
            <Menu.Item key="8">leo</Menu.Item>
          </SubMenu>
        </Menu>
      </Sider>
    )
}

export default Sidebar