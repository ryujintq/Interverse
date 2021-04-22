import { useState, useEffect } from 'react'

export const useMediaQuery = () => {
    const [matches, setMatches] = useState(false)

    useEffect(() => {
        const media = window.matchMedia('(max-width: 768px)')
        if (media.matches !== matches) {
            setMatches(media.matches)
        }
        const listener = () => {
            setMatches(media.matches)
        }
        media.addEventListener('change', listener)
        return () => media.removeEventListener('change', listener)
    }, [matches])

    return matches
}
