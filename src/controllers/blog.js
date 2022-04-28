const { validationResult } = require('express-validator');
const BlogPost = require('../models/blog');
const { post } = require('../routes/auth');
const path = require('path');
const fs = require('fs');

exports.createBlogPost = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const err = new Error('Input value tidak sesuai');
        err.errorStatus = 400;
        err.data = errors.array();
        throw err;
    }

    if (!req.file) {
        const err = new Error('Image harus diupload');
        err.errorStatus = 422;
        err.data = 'Image harus diupload';
        throw err;
    }

    const title = req.body.title;
    const image = req.file.path;
    const body = req.body.body;
    const author = {
        uid: 1,
        name: 'Altiansyah Fanny'
    }

    const Posting = new BlogPost({
        title: title,
        body: body,
        image: image,
        author: author
    })

    Posting.save()
        .then((result) => {
            res.status(201).json({
                message: "Create Blog Success",
                data: result
            });
        })
        .catch(err => console.log(err));


};

exports.getAllBlogPosts = (req, res, next) => {
    const currentPage = req.query.page ? parseInt(req.query.page) : 1;
    const perPage = req.query.perPage ? parseInt(req.query.perPage) : 3;
    let totalItems;

    BlogPost.find().countDocuments()
        .then(count => {
            totalItems = count;
            return BlogPost.find()
                .skip((currentPage - 1) * perPage)
                .limit(perPage);
        })
        .then(result => {
            res.status(200).json({
                message: "Data Blog Post Berhasil Dipanggil",
                data: result,
                total_data: totalItems,
                per_page: perPage,
                current_page: currentPage,
            })
        })
        .catch(err => {
            next(err)
        })
}

exports.getBlogPostById = (req, res, next) => {
    const postId = req.params.postId;

    // return postId;
    BlogPost.findById(postId)
        .then((result) => {

            // return result;
            if (!result) {
                const error = new Error('Blog Post tidak ditemukan');
                error.errorStatus = 404;
                throw error;
            }

            res.status(200).json({
                message: "Data Blog Post Berhasil Dipanggil",
                data: result
            })
        })
        .catch(err => {
            next(err)
        })
}

exports.updateBlogPost = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const err = new Error('Input value tidak sesuai');
        err.errorStatus = 400;
        err.data = errors.array();
        throw err;
    }

    if (!req.file) {
        const err = new Error('Image harus diupload');
        err.errorStatus = 422;
        err.data = 'Image harus diupload';
        throw err;
    }

    const postId = req.params.postId;
    const title = req.body.title;
    const image = req.file.path;
    const body = req.body.body;
    const author = {
        uid: 1,
        name: 'Altiansyah Fanny'
    }

    BlogPost.findById(postId)
        .then((post) => {
            if (!post) {
                const error = new Error('Blog Post tidak ditemukan');
                error.errorStatus = 404;
                throw error;
            }

            post.title = title;
            post.body = body;
            post.image = image;
            post.author = author;

            return post.save()
        })
        .then((result) => {
            res.status(200).json({
                message: "Update Success",
                data: result
            })
        })
        .catch(err => {
            next(err)
        })


}

exports.deleteBlogPost = (req, res, next) => {
    const postId = req.params.postId;

    BlogPost.findById(postId)
        .then((post) => {
            if (!post) {
                const error = new Error('Blog Post tidak ditemukan');
                error.errorStatus = 404;
                throw error;
            }

            // delete image
            removeImage(post.image);
            BlogPost.findByIdAndRemove(postId)
                .then((result) => {
                    res.status(200).json({
                        message: 'Blog Post berhasil dihapus',
                        data: result
                    })
                })
                .catch(err => {
                    next(err)
                })
        })
        .catch(err => {
            next(err)
        })
}

const removeImage = (filePath) => {
    filePath = path.join(__dirname, '../..', filePath)
    fs.unlink(filePath, err => console.log(err));
}