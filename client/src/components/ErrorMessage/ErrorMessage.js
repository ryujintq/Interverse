import React from 'react'
import './ErrorMessage.css'

const ErrorMessage = ({ text }) => {
    return <p className='error-message'>{text}</p>
}

export default ErrorMessage
