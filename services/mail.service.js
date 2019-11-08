const config = require('../config');
const nodemailer = require('nodemailer');
const responseSvc = require('./response.service');

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

            }
        });
        return responseSvc.successMessage("Email sent");
    } catch(err) {
        return responseSvc.errorMessage(err.message, 400);
    }
}

module.exports = {
    sendEmail
}