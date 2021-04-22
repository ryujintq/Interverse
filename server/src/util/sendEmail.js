import nodemailer from 'nodemailer'

export default async (email, id) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'tariqnabhani@gmail.com',
            pass: 'tmyfymduovcnzeoz'
        }
    })

    const message = `
        Please click the link below to verify your email account: 

        https://interverse-lcsrujzezq-lz.a.run.app/api/v1/users/verify/${id}
    `

    const mailOptions = {
        from: '"Interverse" <tariqnabhani@gmail.com>',
        to: email,
        subject: 'Interverse Account Verification',
        text: message,
        html: message
    }

    transporter.sendMail(mailOptions, (error, info) => {
        error ? console.log(error) : console.log('Email sent: ' + info.response)
    })
}