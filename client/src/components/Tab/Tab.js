import React from 'react'
import './Tab.css'

const Tab = ({ activeTab, label, onClick }) => {
    const onTabClick = () => {
        onClick(label)
    }

    let className = 'tab-list-item'

    if (activeTab === label) className += ' tab-list-active'

    return (
        <li
            className={className}
            onClick={onTabClick}
        >
            {label}
        </li>
    )
}

export default Tab
