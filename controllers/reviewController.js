const { StatusCodes } = require("http-status-codes")
const CustomError = require('../errors')
const Review = require('../models/Review')
const Product = require('../models/Products')
const { checkPermissions } = require('../utils')

const createReview = async (req, res) => {
    const { product: productId } = req.body;
    const isValidProduct = await Product.findOne({ _id: productId })
    if (!isValidProduct) {
        throw new CustomError.NotFound(`No product with id: ${productId}`)
    }
    const alreadySubmitted = await Review.findOne({
        product: productId,
        user: req.user.userId
    })
    if (alreadySubmitted) {
        throw new CustomError.BadRequestError('Already submitted review for this product')
    }
    req.body.user = req.user.userId;
    const review = await Review.create(req.body)
    res.status(StatusCodes.CREATED).json({ review })
}

const getAllReviews = async (req, res) => {
    const reviews = await Review.find({}).populate({
        path: 'product',
        select: 'name company price',
    });

    res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

const getSingleReview = async (req, res) => {
    const { id: reviewId } = req.params

    const review = await Review.findOne({ _id: reviewId }).populate('reviews')
    if (!review) {
        throw new CustomError.NotFound(`No review with id: ${reviewId}`)
    }
    res.status(StatusCodes.CREATED).json({ review })
}

const updateReview = async (req, res) => {
    const { id: reviewId } = req.params
    const { rating, title, comment } = req.body;
    const review = await Review.findByIdAndUpdate(
        { _id: reviewId, user: req.user.userId },
        { rating, title, comment },
        { new: true }
    )
    if (!review) {
        throw new CustomError.NotFound(`No review with id: ${reviewId}`)
    }
    checkPermissions(req.user, review.user);
    res.status(StatusCodes.CREATED).json({ review })
}

const deleteReview = async (req, res) => {
    const { id: reviewId } = req.params;
    const review = await Review.findByIdAndDelete({ _id: reviewId, user: req.user.userId })
    if (!review) {
        throw new CustomError.NotFound(`No review with id: ${reviewId}`)
    }
    checkPermissions(req.user, review.user)
    res.status(StatusCodes.CREATED).json({ msg: 'Success! Review removed' })
}

const getSingleProductReviews = async (req, res) => {
    const { id: productId } = req.params;
    const reviews = await Review.find({ product: productId });
    res.status(StatusCodes.OK).json({ reviews, count: reviews.length })
}

module.exports = {
    createReview,
    getAllReviews,
    getSingleReview,
    updateReview,
    deleteReview,
    getSingleProductReviews
}