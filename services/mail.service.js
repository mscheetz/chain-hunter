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
    const transport = nodemailer.createTransport({
        host: config.EMAILHOST,
        port: config.EMAILPORT,
        secure: true,
        auth: {
            user: config.EMAILUSERNAME,
            pass: config.EMAILPASSWORD
        }
    });
    const mailMessage = {
        to: recipient,
        subject: subject,
        body: body
    };

    try{
        transport.sendMail(mailMessage, (err, info)=> {
            if(err) {
                return false;
            }
            return true;
        });
        return true;
    } catch(err) {
        return false;
    }
}

module.exports = {
    sendEmail
}