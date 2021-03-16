import React from 'react'
import './ButtonTransparent.css'

const ButtonTransparent = ({ text, onClick }) => {
    return (
        <button className='btn--transparent' onClick={onClick}>
            {text}
        </button>
    )
}

export default ButtonTransparent