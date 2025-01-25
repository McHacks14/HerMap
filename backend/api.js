const crypto = require('crypto');
const bcrypt = require("bcrypt");
const { Post, User } = require("./models");
const mongoose = require('mongoose');
const apiRoute = '/api'
const saltRounds = 5

const sessions = new Map();

function auth(req, res, next) {
    if (req.cookies.sessionId == undefined) {
        res.status(403) // Forbidden
        return res.send("Forbidden access")
    }

    const user = sessions.get(req.cookies.sessionId);
    if (user == undefined) {
        res.status(403) // Forbidden
        return res.send("Forbidden access")
    }
    req.username = user;
    next();
}

function loadApi(app) {
    
    app.post(apiRoute + '/login', async (req, res) => {
        console.log("POST /login")
        if (req.body == undefined || !("username" in req.body) || !("password" in req.body)) {
            res.status(400); // Bad request
            return res.send("Missing username and/or password")
        }

        // Get the credentials
        const username = req.body.username.toLowerCase()
        const password = req.body.password.toLowerCase()

        // Check the credentials
        const user = await User.findOne({ username: username })

        if (!user || user.password == undefined) {
            res.status(403); // Forbidden
            return res.send("Invalid username or password")
        }
        const match = await bcrypt.compare(password, user.password)
        if (!match) {
            res.status(403); // Fobidden
            return res.send("Invalid username or password")
        }

        // Check if a session already exists
        if (req.cookies.sessionId != undefined) {
            const sessionUsername = sessions.get(req.cookies.sessionId)
            if (sessionUsername === username) {
                // Cookie already set
                res.status(200);
                return res.send(username)
            }
        }

        const sessionId = crypto.randomUUID()
        sessions.set(sessionId, username)
        res.status(200);
        res.cookie('sessionId', sessionId,
            {
                httpOnly: true,
                secure: false, // Set to true for HTTPS server
            }
        )
        return res.send(username)
    })

    app.post(apiRoute + '/register', async (req, res) => {
        console.log("POST /register")
        if (req.body == undefined || !("username" in req.body) || !("password" in req.body)) {
            res.status(400); // Bad request 
            return res.send("Missing username and/or password")
        }

        // Get the credentials
        const username = req.body.username.toLowerCase()
        const password = req.body.password.toLowerCase()

        // Check the credentials format
        // Errors could also use status 422 Unprocessable Content
        if (username.length < 2) {
            res.status(400); // Bad request
            return res.send("Username must be at least 2 characters")
        }
        if (!/^[a-zA-Z0-9]*$/.test(username)) {
            res.status(400); // Bad request
            return res.send("Username must only contain letters and numbers")
        }
        if (password.length < 5) {
            res.status(400); // Bad request
            return res.send("Password must be at least 5 characters")
        }

        // Check the username availability
        // Could use a unique index instead for the username
        const user = await User.findOne({ username: username })
        if (user != null) {
            res.status(409); // Conflict
            return res.send("Username already taken")
        }
        
        // Register the user on the db
        try {
            const hash = await bcrypt.hash(password, saltRounds)
            const newUser = new User({
                username: username,
                password: hash
            });
            await newUser.save()
            
        } catch (err) {
            res.status(500) // Internal server error
            return res.send("Could not create the user")
        }

        // Create a user session
        console.log(`Created new user @${username}`)
        const sessionId = crypto.randomUUID()
        sessions.set(sessionId, username)
        res.cookie('sessionId', sessionId,
            {
                httpOnly: true,
                secure: false, // Set to true for HTTPS server
            }
        )

        res.status(200);
        return res.send(username)
    })

    app.get(apiRoute + "/auth", auth, (req, res) => {
        console.log("GET /auth")
        res.status(200)
        return res.send(req.username)
    })

    app.post(apiRoute + "/logout", auth, (req, res) => {
        console.log("POST /logout")
        const sessionId = req.cookies.sessionId;
        sessions.delete(sessionId);
        res.status(200);
        return res.send(req.username);
    })

    app.post(apiRoute + "/post", auth, async (req, res) => {
        console.log("POST /post")
        if (req.body == undefined || !("content" in req.body)) {
            res.status(400) // Bad request
            return res.send("Missing content")
        }

        // Verify content
        const content = req.body.content;
        if (content.length > 200) {
            res.status(400) // Bad request
            return res.send("Content exceeds 200 characters")
        }

        // Get the parent post
        const parentId = req.body.parent == undefined ? null : req.body.parent;
        
        let parentPost = null
        if (parentId != null) {
            parentPost = await Post.findById(parentId);
            if (parentPost == null) {
                res.status(400) // Bad request
                return res.send("Invalid parent was provided")
            }
        }
        
        // Create a new post
        const newPost = new Post({ 
            author: req.username, 
            content: content, 
            date: Date.now(), 
            toplevel: parentPost == null,
            comments: []
        });
        
        const session = await mongoose.startSession();
        try {
            // Update the comments of the parent post
            // Save all posts
            await session.startTransaction();
            await newPost.save()
            if (parentPost != null) {
                parentPost.comments = [newPost._id].concat(parentPost.comments)
                await parentPost.save()
            }
            await session.commitTransaction();

        } catch (err) {
            await session.abortTransaction();
            res.status(500) // Internal server error
            return res.send("Could not publish the post")
        } finally {
            await session.endSession();
        }

        res.status(200)
        res.set('Content-Type', 'application/json')
        return res.send(JSON.stringify(newPost))

    })

    app.get(apiRoute + "/post/:id", auth, async (req, res) => {
        const postId = req.params.id;
        console.log(`GET /post/${postId}`)

        try {
            const post = await Post.findById(postId);
            if (!post) {
                res.status(404) // Not found error
                return res.send("Post not found")
            }
            
            const commentedPost = await post.populate('comments')
            res.status(200)
            res.set('Content-Type', 'application/json')
            return res.send(JSON.stringify(commentedPost))

        } catch (error) {
            // console.log(error)
            res.status(500) // Internal server error
            return res.send("Could not retrieve the post")
        }
    })

    app.get(apiRoute + "/list/:count", auth, async (req, res) => {
        let count = req.params.count;
        if (count < 0) {
            count = 0;
        }
        console.log(`GET /list/${count}`)

        try {
            const posts = await Post.find({toplevel: true})
            .sort('-date')
            .limit(count)
            .exec();
            
            res.status(200)
            res.set('Content-Type', 'application/json')
            return res.send(JSON.stringify(posts))

        } catch (error) {
            // console.log(error)
            res.status(500) // Internal server error
            return res.send("Could not retrieve the post")
        }
    })

}

module.exports = {loadApi}