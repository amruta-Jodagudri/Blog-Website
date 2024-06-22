// Express
const express = require("express");
const app = express();

// Modules
require("dotenv").config();
const ejs = require("ejs");
const _ = require('lodash');
const methodOverride = require('method-override');

// Mongoose
const mongoose = require("mongoose");
mongoose.connect(process.env.URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Global Variables
const homeContent = "Welcome to our blog! Here you'll find a variety of articles on different topics, ranging from technology and lifestyle to travel and food. We strive to bring you insightful and engaging content that keeps you informed and entertained. Whether you're looking for the latest tech trends, tips for living a healthier life, or travel guides to exotic destinations, we've got you covered. Stay tuned for regular updates and feel free to share your thoughts and comments on our posts. Happy reading!";

const aboutContent = "Our blog was founded with a simple mission: to create a space where people can come to learn, share, and connect over the things they're passionate about. Our team of writers is dedicated to delivering high-quality, well-researched articles that cover a broad spectrum of interests. From the latest advancements in technology to the best recipes for your next dinner party, we aim to provide content that is both informative and enjoyable. We believe in the power of storytelling and the importance of community, and we hope that through our blog, we can build a vibrant and supportive network of readers. Thank you for being a part of our journey!";

const contactContent = "We'd love to hear from you! Whether you have questions, feedback, or just want to say hello, feel free to reach out to us. You can contact us via email at info@ourblog.com or follow us on our social media channels. We're always open to suggestions for new topics and improvements, so don't hesitate to get in touch. Let's stay connected and continue to grow our community together. Thank you for your support and for being a part of our blog!";


// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(methodOverride('_method'));
app.use("/css", express.static(__dirname + "public/css"));
app.use("/img", express.static(__dirname + "public/img"));
app.set("views", "./views");
app.set("view engine", "ejs");

// Database
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Database is connected");

  // Post Schema
  const postSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    }
  });
  const Post = mongoose.model("Post", postSchema);

  // Home Page
  app.get("/", (req, res) => {
    Post.find(function (err, posts) {
      res.render("home", {
        homeContent: homeContent,
        posts: posts,
        _: _
      });
    });
  });

  // About Page
  app.get("/about", (req, res) => {
    res.render("about", { aboutContent: aboutContent });
  });

  // Contact Page
  app.get("/contact", (req, res) => {
    res.render("contact", { contactContent: contactContent });
  });

  // Compose Page
  app.get("/compose", (req, res) => {
    res.render("compose");
  });

  // Publish Post
  app.post("/compose", (req, res) => {
    const post = new Post({
      title: req.body.postTitle,
      content: req.body.postContent
    });

    post.save(function (err) {
      if (!err) {
        res.redirect("/");
      }
    });
  });

  // View Post
  app.get("/posts/:postId", function (req, res) {
    const requestedPostId = req.params.postId;

    Post.findOne({ _id: requestedPostId }, function (err, post) {
      res.render("post", {
        title: post.title,
        content: post.content
      });
    });
  });

  // Edit Post
  app.get("/posts/:id/edit", async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      res.render("edit", { post });
    } catch (err) {
      console.error(err);
      res.redirect('/');
    }
  });

  // Update Post
  app.put("/posts/:id", async (req, res) => {
    try {
      const post = await Post.findByIdAndUpdate(req.params.id, {
        title: req.body.postTitle,
        content: req.body.postContent
      }, { new: true });
      res.redirect(`/posts/${post._id}`);
    } catch (err) {
      console.error(err);
      res.redirect('/');
    }
  });

  // Delete Post
  app.delete("/posts/:id", async (req, res) => {
    try {
      await Post.findByIdAndDelete(req.params.id);
      res.redirect('/');
    } catch (err) {
      console.error(err);
      res.redirect('/');
    }
  });
});

// Listen on port
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port, () => {
  console.log(`Server is running on ${port}.`);
});
