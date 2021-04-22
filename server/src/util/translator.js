import gct from '@google-cloud/translate'
const { Translate } = gct.v2

export default async (text, target) => {

    try {
        const translate = new Translate({ projectId: 'chat-app-296017', keyFilename: 'chat-app-296017-f6d1afc23e03.json' });

        const [translation] = await translate.translate(text, target);

        return translation
    } catch (err) {
        console.log(err)
    }
}