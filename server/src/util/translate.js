import translator from './translator.js'

const translate = async (languages, message, userLanguage) => {
    const translatedMessages = []

    //translate the message to all other languages associated with the chat
    //only translate if there is more than one language associated with the chat
    //dont translate if its the senders own language
    if (languages.length > 1) {
        for (let i = 0, iEnd = languages.length; i < iEnd; i++) {
            if (languages[i] == userLanguage) {
                translatedMessages.push({ language: languages[i], content: message })
                continue
            }
            const tranlatedText = await translator(message, languages[i])
            translatedMessages.push({ language: languages[i], content: tranlatedText })
        }
    } else {
        translatedMessages.push({ language: languages[0], content: message })
    }

    return translatedMessages
}

export default translate