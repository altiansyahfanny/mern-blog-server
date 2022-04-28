const nodemailer = require('nodemailer');
const path = require('path')
const hbs = require('nodemailer-express-handlebars');

exports.sendEmailFunc = (body) => {

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: 'fannyaltiansyah@gmail.com',
            pass: 'dlsfslrhbdoirmyk',
        },
    });

    const handlebarOptions = {
        viewEngine: {
            extName: ".handlebars",
            partialsDir: path.resolve('./src/helpers/view'),
            defaultLayout: false,
        },
        viewPath: path.resolve('./src/helpers/view'),
        extName: ".handlebars",
    }

    transporter.use('compile', hbs(handlebarOptions));

    return (
        transporter.sendMail(body).then(res => console.log(res))
    )
}