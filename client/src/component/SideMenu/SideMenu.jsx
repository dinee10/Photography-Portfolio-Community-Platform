import React from 'react'
import { Menu } from 'antd'
import '@ant-design/icons'
import { DashboardOutlined, FileWordOutlined, ProductOutlined, ShopOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

function SideMenu() {
    const navigate = useNavigate();

    return (
        <div 
            className='SideMenu'
            style={{
                padding: '20px',  // Added padding around the menu
                width: '250px',   // Increased width (adjust as needed)
                background: '#fff' // Optional: adds background for better visibility
            }}
        >
            <Menu
                onClick={(item) => { navigate(item.key) }}
                style={{
                    padding: '10px 0',  // Added vertical padding
                }}
                items={[
                    {
                        label: "Profile",
                        icon: <DashboardOutlined />,
                        key: '/profile',
                        style: { marginBottom: '15px' }  // Space between items
                    },
                    {
                        label: "Learning Progress",
                        icon: <ShopOutlined />,
                        key: '/progresslist',
                        style: { marginBottom: '15px' }
                    },
                    {
                        label: "Learning Plan",
                        icon: <ProductOutlined />,
                        key: '#',
                        style: { marginBottom: '15px' }
                    },
                    {
                        label: "Blogs",
                        icon: <FileWordOutlined />,
                        key: '#',
                        style: { marginBottom: '15px' }
                    },
                ]}
            />
        </div>
    )
}

export default SideMenu;