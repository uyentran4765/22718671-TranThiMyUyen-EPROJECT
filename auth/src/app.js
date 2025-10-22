const express = require("express");
const mongoose = require("mongoose");
const config = require("./config");
const authMiddleware = require("./middlewares/authMiddleware");
const AuthController = require("./controllers/authController");
const MessageBroker = require('./helpers/messageBroker');
const User = require('./models/user')
const bcrypt = require("bcryptjs"); // Thêm bcrypt để hash mật khẩu

class App {
  constructor() {

    this.app = express();
    this.authController = new AuthController();
    this.connectDB();
    this.setMiddlewares();
    this.setRoutes();
    this.setUpMessageQueue()
  }

  async connectDB() {
    try {
      // console.log(config.mongoURI, 'đường dẫn môngdb');
      await mongoose.connect(config.mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      console.log("MongoDB connected");
    } catch (err) {
      console.log(err);
    }


  }

  async seedDB() {
    try {
      // Kiểm tra xem tài khoản testuser đã tồn tại chưa
      const existingUser = await User.findOne({ username: "testuser" });
      if (!existingUser) {
        // Hash mật khẩu
        const hashedPassword = await bcrypt.hash("123456", 10);

        // Tạo tài khoản testuser
        await User.create({
          username: "testuser",
          password: hashedPassword,
        });
        console.log("Test user seeded successfully");
      } else {
        console.log("Test user already exists, skipping seeding");
      }
    } catch (error) {
      console.error("Seeding error:", error);
      throw error;
    }
  }

  async disconnectDB() {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }

  async setUpMessageQueue() {
    await MessageBroker.setUpConnection()
  }

  setMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
  }

  setRoutes() {
    this.app.post("/auth/api/v1/login", (req, res) => this.authController.login(req, res));
    this.app.post("/auth/api/v1/register", (req, res) => this.authController.register(req, res));
    this.app.get("/auth/api/v1/dashboard", authMiddleware, this.authController.getProfile);
  }

  async start() {
    await this.seedDB();
    this.server = this.app.listen(3000, () => console.log("Server started on port 3000"));
  }

  async stop() {
    await mongoose.disconnect();
    this.server.close();
    console.log("Server stopped");
  }
}

module.exports = App;
