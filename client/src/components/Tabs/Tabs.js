import React, { useEffect, useState } from 'react'
import Tab from '../Tab/Tab'
import './Tabs.css'

const Tabs = ({ children, onTabChange }) => {
    const [activeTab, setActiveTab] = useState(children[0].props.label)

    useEffect(() => {
        onTabChange()
    }, [activeTab])

    const onTabItemClick = tab => {
        setActiveTab(tab)
    }

    return (
        <div className='tabs'>
            <ol className="tab-list">
                {
                    children.map(child => {
                        const { label } = child.props
                        return (
                            <Tab
                                key={label}
                                activeTab={activeTab}
                                label={label}
                                onClick={onTabItemClick}
                            />
                        )
                    })
                }
            </ol>
            <div className="tab-content">
                {children.map(child => {
                    if (child.props.label !== activeTab) return undefined
                    return child.props.children
                })}
            </div>
        </div>
    )
}

export default Tabs
