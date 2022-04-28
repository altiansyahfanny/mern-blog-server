const User = require("../models/user");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator');
const { sendEmailFunc } = require('../helpers')

exports.register = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // const err = new Error('Input value tidak sesuai');
        // err.errorStatus = 400;
        // err.data = errors.array();
        // throw err;

        return res.status(400).json({
            message: 'Validation Error',
            data: errors.array()
        })
    }

    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    try {
        const newPassword = await bcrypt.hash(password, 10)
        await User.create({
            name: name,
            email: email,
            password: newPassword,
        })
        const result = {
            message: 'Register Success',
            data: {
                uid: 1,
                name: name,
                email: email
            }

        }
        res.status(201).json(result)
    } catch (err) {
        res.status(422).json({ status: 'error', error: 'Duplicate email' })
        // console.log(err)
    }
    next();
}

exports.login = async (req, res, next) => {
    const user = await User.findOne({
        email: req.body.email,
    })

    if (!user) {
        return { status: 'error', error: 'Invalid login' }
    }

    const isPasswordValid = await bcrypt.compare(
        req.body.password,
        user.password
    )

    if (isPasswordValid) {
        const token = jwt.sign(
            {
                name: user.name,
                email: user.email,
            },
            'secret123'
        )

        const result = {
            message: 'Login Success',
            data: {
                token: token,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email
                }
            }
        }

        return res.status(200).json(result)
    } else {
        return res.status(401).json({ message: 'Failed Login' })
    }

}

exports.forgotPassword = async (req, res) => {
    const email = req.body.email;

    const user = await User.findOne({ email: email })
    if (!user) {
        return res.status(404).json({
            message: 'User tidak ditemukan'
        })
    }

    const token = jwt.sign({
        idUser: user._id
    }, 'secret123')

    await user.updateOne({
        resetPasswordLink: token,
        resetPasswordLinkExpiredDate: new Date().getTime() + (30 * 60 * 1000)
    })

    sendEmailFunc({
        from: 'admin@mernblog.id',
        to: email,
        subject: 'Reset Password',
        template: 'forgotPassword',
        context: {
            url: `http://localhost:3000/reset-password/${token}`,
            token: token
        }
    });
    return res.status(200).json({
        message: 'Email reset password berhasil dikirim',
    })
}

exports.resetPassword = async (req, res) => {
    const { token, password } = req.body

    const user = await User.findOne({ resetPasswordLink: token });

    if (!user || !token) {
        return res.status(400).json({
            message: 'Wrong URL!'
        })
    }

    const date = new Date(user.resetPasswordLinkExpiredDate).getTime()
    const dateNow = new Date().getTime()

    if (date < dateNow) {
        return res.status(400).json({
            message: 'Link Expired!'
        })
    }

    const newPassword = await bcrypt.hash(password, 10)
    await user.updateOne({
        password: newPassword,
        resetPasswordLink: null,
        resetPasswordLinkExpiredDate: null
    })

    res.status(200).json({
        message: 'Success reset password',
        user: user,
        date: date,
        dateNow: dateNow,
    })
}