const config = require('../config');
const nodemailer = require('nodemailer');

/**
 * Send an email
 * 
 * @param {string} recipient email recipient(s)
 * @param {string} subject email subject
 * @param {string} body email message body
 */
const sendEmail = async(recipient, subject, body) => {
    const mailConfig = {
        service: 'Godaddy',
        host: config.EMAIL_HOST,
        secureConnection: true,
        port: config.EMAIL_PORT,
        auth: {
            user: config.EMAIL_USERNAME,
            pass: config.EMAIL_PASSWORD
        }
    };
    const transport = nodemailer.createTransport(mailConfig);
    const mailMessage = {
        from: config.EMAIL_USERNAME,
        to: recipient,
        subject: subject,
        html: body
    };

    try{
        transport.sendMail(mailMessage, (err, info)=> {
            if(err) {
                console.log('err', err);
                return false;
            }
            console.log('info', info);
            return true;
        });
        return true;
    } catch(err) {
        console.log(err);
        return false;
    }
}

module.exports = {
    sendEmail
}