const { User } = require("../../models");
const redis_client = require("../../redis_connect");

// import bcrypt
const bcrypt = require("bcrypt");
//import jsonwebtoken
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    //generate salt random value with 10 rounds
    const salt = await bcrypt.genSalt(10);
    // hash password from request with salt
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = await User.create({
      email: req.body.email,
      username: req.body.username,
      idRole: req?.body?.idRole,
      password: hashedPassword,
    });

    res.status(200).send({
      status: "Success...",
      data: {
        email: newUser.email,
        username: newUser.username,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "Failed",
      message: "Server Error",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const userExist = await User.findOne({
      where: {
        email: req.body.email,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    //compare password between entered from client and from database
    const isValid = await bcrypt.compare(req.body.password, userExist.password);

    //check if not valid return response with status 400
    if (!isValid) {
      return res.status(400).send({
        status: "Failed",
        message: "Email and Pasword Not Match",
      });
    }

    // generate token
    const token = jwt.sign({ id: userExist.id }, process.env.TOKEN_KEY);

    const refresh_token = redis_client.get(userExist.id.toString(), (err, data) => {
      if (err) throw err;

      redis_client.set(userExist.id.toString(), JSON.stringify({ refreshToken: refresh_token }));
    });

    res.status(200).send({
      status: "Success...",
      data: {
        username: userExist.username,
        idRole: userExist.idRole,
        token,
        refresh_token
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "Failed",
      message: "Server Error",
    });
  }
};

exports.checkAuth = async (req, res) => {
  try {
    const id = req.user.id;

    const dataUser = await User.findOne({
      where: {
        id,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "password"],
      },
    });

    if (!dataUser) {
      return res.status(404).send({
        status: "failed",
      });
    }

    res.send({
      status: "success...",
      data: {
        user: {
          id: dataUser.id,
          username: dataUser.name,
          email: dataUser.email,
          idRole: dataUser.idRole
        },
      },
    });
  } catch (error) {
    console.log(error);
    res.status({
      status: "failed",
      message: "Server Error",
    });
  }
};
