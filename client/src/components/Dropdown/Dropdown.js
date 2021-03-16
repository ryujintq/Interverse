import React, { useState, useEffect } from 'react'
import languageList from '../../assets/languages'
import './Dropdown.css'

const Dropdown = ({ name, value, onChange, onSelect, placeholder }) => {
    const [searchInput, setSearchInput] = useState('') //search field inside dropdown
    const [isFocused, setIsFocused] = useState(false) //if input field is in focus, dropdown appears
    const [languages, setLanguages] = useState([...languageList]) //state for filtered language list

    //Sets the input field to the chosen language and closes dropdown
    const handleSelection = element => {
        onSelect(element)
        setIsFocused(false)
    }

    //Filters the list
    useEffect(() => {
        if (searchInput === '') {
            setLanguages([...languageList])
        } else {

            setLanguages(() => {
                return languageList.filter(lang => {
                    const lowerCaseLang = lang.toLowerCase()
                    return lowerCaseLang.startsWith(searchInput.toLowerCase())
                })
            })
        }
    }, [searchInput])

    return (
        <div className='dropdown-container'>
            <input
                className='dropdown-input'
                type='text'
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                readOnly
                onFocus={() => setIsFocused(true)}
            />
            {isFocused && (
                <div className='dropdown'>
                    <input
                        className='dropdown-search'
                        placeholder='Search for a language'
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)} />
                    <div className="dropdown-list">
                        {languages.map((element, index) => (
                            <p key={index} className='dropdown-element' onClick={() => handleSelection(element)}>{element}</p>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Dropdown
