const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserRepository = require("../repositories/userRepository");
const messageBroker = require('../helpers/messageBroker')
const config = require("../config");
const User = require("../models/user");

/**
 * Class to hold the business logic for the auth service interacting with the user repository
 */
class AuthService {
  constructor() {
    this.userRepository = new UserRepository();
    this.checkMessageProfile = null;
  }

  async findUserByUsername(username) {
    const user = await User.findOne({ username });
    return user;
  }

  async login(username, password) {
    const user = await this.userRepository.getUserByUsername(username);

    if (!user) {
      return { success: false, message: "Invalid username or password" };
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return { success: false, message: "Invalid username or password" };
    }

    const token = jwt.sign({ id: user._id, username: username }, config.jwtSecret);

    return { success: true, token };
  }

  async register(user) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    return await this.userRepository.createUser(user);
  }

  async deleteTestUsers() {
    // Delete all users with a username that starts with "test"
    await User.deleteMany({ username: /^test/ });
  }


  async getAllOrder(id) {
    const user = await this.userRepository.getUserById(id);
    const data = {
      username: user.username
    }


    console.log(data)
    await messageBroker.publishMessage('get-all-order', data);
    this.checkMessageProfile = null;

    messageBroker.channel.consume('wait-get-all-order', (msg) => {
      const data = JSON.parse(msg.content.toString());
      this.checkMessageProfile = data
    })

    while (!this.checkMessageProfile) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const newUser = {
      ...user,
      orders: this.checkMessageProfile,
    }

    return newUser;
  }
}

module.exports = AuthService;
