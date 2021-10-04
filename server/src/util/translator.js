import gct from '@google-cloud/translate'
const { Translate } = gct.v2

export default async (text, target) => {

    try {
        const translate = new Translate({ projectId: process.env.PROJECT_ID, keyFilename: process.env.KEY_FILE });

        const [translation] = await translate.translate(text, target);

        return translation
    } catch (err) {
        console.log(err)
    }
}