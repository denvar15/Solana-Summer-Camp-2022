import React from 'react'
import { Layout, Menu, Breadcrumb, Row, Col, Card, Button, Badge, List, Avatar, Space, Tabs, Image } from 'antd';
import { Sidebar } from './../components'
import axios from 'axios'
import { useParams, Link } from 'react-router-dom'

const Nft = (props) => {
    const { address } = useParams()
    const [item, setItem] = React.useState([])
    React.useEffect(() => {
        async function getData() {
            try {
                const [itemResponse] = await Promise.all([axios.get(`http://94.228.122.16:8080/nft?address=${address}`)])
                setItem(itemResponse.data)
                console.log(itemResponse.data)

            } catch (error) {
                console.log('Ошибка при запросе данных ;(')
                console.error(error)
            }
        }
        getData()
    }, [address])

    return(
        <Layout id="gamePage">
            <Layout>

                <Sidebar />
                <Layout  >
                <Breadcrumb className='pt-2 ps-2'>
                    <Breadcrumb.Item>
                        <Link to="/">Home</Link>    
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Link to="/Game">Genopet</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        {item.name}
                    </Breadcrumb.Item>
                </Breadcrumb>
                <Row gutter={16} className='pt-5'>

                    <Col className="gutter-row text-start ps-2" span={12}>

                    <Image
                        width={400}
                        src={item.img}
                    />
                    </Col>
                    <Col className="gutter-row text-start" span={12}>
                        <p>#{item.id}</p>
                        <h1>{item.name}</h1>
                        <h4>{item.description}</h4>
                        Owner: {item.owner} <br />
                        <Button type="primary" className='mt-4'>
                            Start Barter
                        </Button>
                    </Col>

                </Row>
                </Layout>
            </Layout>
        </Layout>
    )
}

export default Nft