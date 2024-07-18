import nodemailer from 'nodemailer';
const GMAIL_USER="support@mjmarry.com"
const GMAIL_PASS="oibn knok jhhw yxhj"

export const sendMail = async (email: string, subject: string, message: string): Promise<boolean> => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER, 
            pass: process.env.GMAIL_PASS 
        }
    });

    let mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: subject,
        text: message
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
        return true;
    } catch (error) {
        console.error('Error Occurs', error);
        return false;
    }
};
