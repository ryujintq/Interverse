import React, { useState } from 'react'
import Button from '../../components/Button/Button'
import ButtonTransparent from '../../components/ButtonTransparent/ButtonTransparent'
import Dropdown from '../../components/Dropdown/Dropdown'
import Input from '../../components/Input/Input'
import { useDispatch, useSelector } from 'react-redux'
import { login, signup, setErrorMessage, clearErrorMessage } from '../../redux/actions/authActions'
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage'
import './Authentication.css'
import isEmail from '../../util/isEmail'

const Authentication = () => {
    const [isSliderLeft, setIsSliderLeft] = useState(true) //controls position of slider
    const [loginData, setLoginData] = useState({ email: '', password: '' })
    const [signupData, setSignupData] = useState({ email: '', username: '', language: '', password: '', password2: '' })
    const dispatch = useDispatch()
    const auth = useSelector(state => state.auth)
    const { signedUp, errorMessage } = auth

    //onChange for all login data
    const handleLoginData = (event) => {
        const { name, value } = event.target
        setLoginData(prevState => {
            return {
                ...prevState,
                [name]: value
            }
        })
    }

    //onChange for all signup data
    const handleSignupData = (event) => {
        const { name, value } = event.target
        setSignupData(prevState => {
            return {
                ...prevState,
                [name]: value
            }
        })
    }

    //clear error, move slider
    const handleSlider = () => {
        dispatch(clearErrorMessage())
        setIsSliderLeft(prevState => !prevState)
    }

    //change language in state
    const handleLanguageSelect = language => {
        setSignupData(prevState => {
            return { ...prevState, language }
        })
    }

    //dispatchs login api call and state change
    const handleLogin = e => {
        e.preventDefault()
        dispatch(login(loginData.email, loginData.password))
    }

    //dispatchs signup api call and state change
    const handleSignup = e => {
        e.preventDefault()
        if (!isEmail(signupData.email)) {
            dispatch(setErrorMessage('Please enter a valid email'))
            return
        }
        if (signupData.password === signupData.password2) {
            dispatch(signup(signupData.username, signupData.email, signupData.password, signupData.language))
        } else {
            dispatch(setErrorMessage('Passwords do not match'))
        }
    }

    return (
        <div className='authentication'>
            <div className='authentication-container'>
                <div className={`form-container signup-form-container ${isSliderLeft && 'signup-right'}`}>
                    {signedUp
                        ? <div className="notification-container">
                            <h3 className='signed-up-msg'>An email has been sent to the one provided. <br /> Please click the link within to verify</h3>
                        </div>
                        : (
                            <form className='form signup-form'>
                                <h1>Signup</h1>
                                <div>
                                    {errorMessage && <ErrorMessage text={errorMessage} />}
                                    <Input type='text' name='username' value={signupData.username} onChange={handleSignupData} placeholder='Username' />
                                    <Input type='text' name='email' value={signupData.email} onChange={handleSignupData} placeholder='Email' />
                                    <Dropdown name='langauge' value={signupData.language} onChange={() => { }} onSelect={handleLanguageSelect} placeholder='Language' />
                                    <Input type='password' name='password' value={signupData.password} onChange={handleSignupData} placeholder='Password' />
                                    <Input type='password' name='password2' value={signupData.password2} onChange={handleSignupData} placeholder='Confirm Password' />
                                </div>
                                <Button text='Confirm' onClick={e => handleSignup(e)} />
                            </form>
                        )}
                </div>
                <div className={`form-container login-form-container ${!isSliderLeft && 'login-left'}`}>
                    <form className='form login-form'>
                        <h1>Login</h1>
                        <div>
                            {errorMessage && <ErrorMessage text={errorMessage} />}
                            <Input type='text' name='email' value={loginData.email} onChange={handleLoginData} placeholder='Email' />
                            <Input type='password' name='password' value={loginData.password} onChange={handleLoginData} placeholder='Password' />
                        </div>
                        <Button text='Confirm' onClick={e => handleLogin(e)} />
                    </form>
                </div>
                <div className={`slider ${!isSliderLeft && 'slider-right'}`}>
                    <div className={`slider-signup ${!isSliderLeft && 'slider-signup-left'}`}>
                        <div className='slider-text'>
                            <h1 className='white-text'>Hey there!</h1>
                            <h3 className='white-text'>Sign up with us now</h3>
                            <h3 className='white-text'>Your friends are waiting</h3>
                        </div>
                        <ButtonTransparent text='Sign up' onClick={() => handleSlider()} />
                    </div>
                    <div className={`slider-login ${isSliderLeft && 'slider-login-right'}`}>
                        <div className='slider-text'>
                            <h1 className='white-text'>Already have an account?</h1>
                            <h3 className='white-text'>Login now</h3>
                            <h3 className='white-text'>Your friends are waiting</h3>
                        </div>
                        <ButtonTransparent text='Login' onClick={() => handleSlider()} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Authentication
