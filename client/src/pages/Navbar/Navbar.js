import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { signout } from '../../redux/actions/authActions'
import { friendsClear } from '../../redux/actions/friendsActions'
import { chatsClear } from '../../redux/actions/chatActions'
import './Navbar.css'

const Navbar = () => {
    const auth = useSelector(state => state.auth)
    const { token } = auth
    const dispatch = useDispatch()

    const handleSignOut = () => {
        dispatch(friendsClear())
        dispatch(chatsClear())
        dispatch(signout())
    }

    return (
        <div className='navbar'>
            <h1>Interverse</h1>
            {token && <p onClick={handleSignOut}><i className="fas fa-sign-out-alt"></i> Signout</p>}
        </div>
    )
}

export default Navbar
