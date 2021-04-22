import React from 'react'
import './Input.css'

const Input = ({ type, value, name, onChange, placeholder, readOnly, disabled }) => {
    return (
        <input
            className='input'
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            readOnly={readOnly}
            disabled={disabled}
        />
    )
}

Input.defaultProps = {
    type: 'text'
}

export default Input
