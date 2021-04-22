import React, { useEffect, useState } from 'react'
import { useMediaQuery } from '../../util/useMediaQuery'
import Tab from '../Tab/Tab'
import './Tabs.css'

const Tabs = ({ children, onTabChange, onCloseTabs }) => {
    const [activeTab, setActiveTab] = useState(children[0].props.label)

    const isScreenSmall = useMediaQuery()

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
                {isScreenSmall && <li className='tab-list-item close-icon' onClick={onCloseTabs}>X</li>}
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
