// ! module imports
const asyncHandler = require('express-async-handler')
// ! models
const Post = require('../models/postModel')
const User = require('../models/userModel')
const Connections = require('../models/connectionModel')
const Report = require('../models/reportModel')
// ! helpers imports
const generateToken = require('../utils/generateToken')
const Notification = require('../models/notificationModel')
const mongoose = require('mongoose')



// ! create a post
// ? POST /post/add-post
const addPost = asyncHandler(async (req, res) => {
    const {
        userId,
        imageUrls,
        description,
        hideLikes,
        hideComment,
        hashtag
    } = req.body

    if (!userId || !imageUrls) {
        res.status(400)
        throw new Error("fill all fields")
    }
    const hashtagsArray = hashtag.map((tag) => tag.value);
    const post = await Post.create({
        userId,
        imageUrl: imageUrls,
        description,
        hideComment,
        hideLikes,
        hashtags: hashtagsArray,
    })

    if (!post) {
        res.status(400)
        throw new Error("cannot add post")
    }
    const posts = await Post.find()
        .populate({
            path: "userId",
            select: "name profileImg isVerified",
        })
        .sort({ date: -1 })

    res.status(200).json({ message: "Post added succesfully", posts })

})

// ! gwt all posts
// ? GET /post/get-post
const getPosts = asyncHandler(async (req, res) => {
    const { userId, searchTerm } = req.body

    const connections = await Connections.findOne({ userId }, { following: 1 })
    const followingUsers = connections?.following
    // console.log('foll',followingUsers);


    const usersQuery = searchTerm
        ? { $or: [{ isPrivate: false }, { _id: { $in: followingUsers } }, { name: { $regex: searchTerm, $options: "i" } }] }
        : { _id: { $in: followingUsers } };
    const users = await User.find(usersQuery)
    // console.log('quer',usersQuery);
    const userIds = users.map((user) => user._id)

    const postsQuery = {
        userId: { $in: [...userIds, userId] },
        isBlocked: false,
        isDeleted: false
    }

    if (searchTerm) {
        const regexArray = searchTerm.split(' ').map((tag) => new RegExp(tag, 'i'));
        postsQuery['$or'] = [
            { description: { $regex: searchTerm, $options: "i" } },
            { hashtags: { $in: regexArray } }
        ];
    }

    const posts = await Post.find(postsQuery)
        .populate({
            path: "userId",
            select: "name profileImg isVerified"
        })
        .populate({
            path: "likes",
            select: "name profileImg isVerified"
        }).sort({ date: -1 })
    res.status(200).json(posts)
})

// ! delete posts
// ? Post /post/delete-post
const deletePost = asyncHandler(async (req, res) => {
    const { postId, userId } = req.body
    const post = await Post.findById(postId)
    post.isDeleted = true
    await post.save()
    const posts = await Post.find({ isDeleted: false })
        .populate({
            path: "userId",
            select: "name profileImg isVerified"
        }).sort({ date: -1 })
    res.status(200).json(posts)
})

// ! update posts
// ? PUT /post/update-post
const updatePost = asyncHandler(async (req, res) => {
    const postId = req.body.postId
    const { userId, description, hideComment, hashtags, hideLikes } = req.body
    const post = await Post.findById(postId)

    if (description) {
        post.description = description
    }
    if (hideComment !== undefined) post.hideComment = hideComment;
    if (hideLikes !== undefined) post.hideLikes = hideLikes;
    if (hashtags !== undefined) {
        const hashtagsArray = hashtags.map((tag) => tag.value);
        post.hashtags = hashtagsArray;
    }

    await post.save()
    const posts = await Post.find({ isDeleted: false })
        .populate({
            path: "userId",
            select: "name profileImg isVerified"
        }).sort({ date: -1 })
    res.status(200).json(posts)
})

// ! get user posts
// ? get /post/get-post
const getUserPost = asyncHandler(async (req, res) => {
    const id = req.params.userId;

    const posts = await Post.find({ userId: id, isDeleted: false })
        .populate({
            path: "userId",
            select: "name profileImg isVerified"
        }).sort({ date: -1 })
    res.status(200).json(posts)
})

// ! like posts
// ? get /post/get-post
const likePost = asyncHandler(async (req, res) => {
    const { postId, userId } = req.body;
    const post = await Post.findById(postId)

    if (!post) {
        res.status(404)
        throw new Error("Post not found")
    }
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
        await Post.findOneAndUpdate(
            { _id: postId },
            { $pull: { likes: userId } },
            { new: true }
        )
    } else {
        if (post.userId !== userId) {
            const newNotification = new Notification({
                senderId: userId,
                receiverId: post.userId,
                message: 'liked your post',
                link: `/profile`,
                read: false,
                postId: postId,
            });

            await newNotification.save();
        }
        await Post.findOneAndUpdate(
            { _id: postId },
            { $push: { likes: userId } },
            { new: true }
        )
    }

    const posts = await Post.find({
        userId: userId,
        isBlocked: false,
        isDeleted: false,
    })
        .populate({
            path: "userId",
            select: "name profileImg isVerified"
        })
        .sort({ date: -1 })

    res.status(200).json({ posts })
})

// ! save posts
// ? POST /post/save-post
const savePost = asyncHandler(async (req, res) => {
    const { postId, userId, category } = req.body;
    const user = await User.findById(userId)

    if (!user) {
        res.status(404)
        throw new Error("user not found")
    }
    const isSaved = await User.findOne({
        _id: userId,
        'savedPosts.post': postId
    });
    // const isSaved = user.savedPost.find((post) => post._id === postId);

    if (isSaved) {
        await User.findOneAndUpdate(
            { _id: userId },
            { $pull: { savedPost: { post: postId } } },
            { new: true }
        )
    } else {
        await User.findOneAndUpdate(
            { _id: userId },
            { $push: { savedPost: { post: postId, category: category } } },
            { new: true }
        )
    }

    const userData = await User.find({ userId: userId, isBlocked: false }).sort(
        { date: -1 }
    );
    res.status(200).json({
        _id: user.id,
        username: user.name,
        email: user.email,
        profileImg: user.profileImg,
        savedPost: user.savedPost,
        token: generateToken(user.id),
    });
})

// ! save posts
// ? POST /post/save-post
const createCategory = asyncHandler(async (req, res) => {
    const { userId, categoryName } = req.body;
    let user = await User.findById(userId)

    if (!user) {
        res.status(404)
        throw new Error("user not found")
    }
    const isSaved = await User.findOne({
        _id: userId,
        'savedPosts.category': categoryName
    });
    // const isSaved = user.savedPost.find((post) => post._id === postId);

    if (isSaved) {
        throw new Error("category exists")
    } else {
      user = await User.findOneAndUpdate(
            { _id: userId },
            { $push: { savedPost: { category: categoryName } } },
            { new: true }
        )
    }
    

    // const categories = await User.distinct('savedPosts.category', { _id: userId });
    res.status(200).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        profileImg: user.profileImg,
        savedPost: user.savedPost,
        bio: user.bio,
        phone: user.phone,
        isPrivate: user.isPrivate,
        isVerified: user.isVerified,
        token: generateToken(user.id)
    })

})

// ! like posts
// ? get /post/get-post
const getSavedPost = asyncHandler(async (req, res) => {
    const id = req.params.userId
    const category = req.params.category
    const user = await User.findById(id).populate({
        path: 'savedPost',
        populate: {
            path: 'post',
            model: 'Post'
        }
    })
        .populate({
            path: 'savedPost.post',
            populate: {
                path: 'userId',
                select: 'name profileImg isVerified'
            }
        });

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const filteredPosts = user.savedPost.filter(item => item.category === category && item.post);
    // console.log('here');
    const posts = filteredPosts.map(item => item.post)

    console.log('user', posts);
    res.status(200).json(posts)
})

// ! like posts
// ? get /post/get-post
const getCategories = asyncHandler(async (req, res) => {
    const id = req.params.userId
    const categories = await User.distinct('savedPost.category', { _id: id });
    res.status(200).json(categories)
})

// ! report posts
// ? POST /post/report-post
const reportPost = asyncHandler(async (req, res) => {
    const { userId, postId, cause } = req.body;

    const existingReport = await Report.findOne({ userId, postId });
    if (existingReport) {
        res.status(400);
        throw new Error("You have already reported this post.");
    }

    const report = new Report({
        userId,
        postId,
        cause,
    });

    await report.save();

    const reportCount = await Report.countDocuments({ postId });

    const max_report_needed = 3;
    if (reportCount >= max_report_needed) {
        await Post.findByIdAndUpdate(postId, { isBlocked: true });
        res
            .status(200)
            .json({ message: "Post blocked due to multiple reports." });
        return;
    }

    res.status(200).json({ message: "Post has been reported." });
})





module.exports = {
    addPost,
    getPosts,
    deletePost,
    updatePost,
    getUserPost,
    likePost,
    savePost,
    getSavedPost,
    reportPost,
    getCategories,
    createCategory
}