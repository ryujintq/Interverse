import React from 'react'
import './ModalOverlay.css'

const ModalOverlay = ({ children, onCancel }) => {
    return (
        <div className='modal'>
            <div className="modal-cancel" onClick={onCancel}>
                <i className="fas fa-times fa-2x"></i>
            </div>
            {children}
        </div>
    )
}

export default ModalOverlay