import React from 'react'
import './Input.css'

const Input = ({ type, value, name, onChange, placeholder, readOnly }) => {
    return (
        <input
            className='input'
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            readOnly={readOnly}
        />
    )
}

Input.defaultProps = {
    type: 'text'
}

export default Input
