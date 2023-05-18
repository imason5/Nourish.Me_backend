const bcryptjs = require("bcryptjs");
const User = require("../models/User.model");
const jwt = require("jsonwebtoken");
// const { isAuthenticated } = require("../middleware/jwt.middleware"); Add this later

const router = require("express").Router();

// ******* SIGNUP ROUTE *******
router.post("/signup", async (req, res) => {
  // TODO: Add input validation here, e.g. check if password is strong enough

  const salt = bcryptjs.genSaltSync(parseInt(process.env.SALT_ROUNDS) || 13);
  const passwordHash = bcryptjs.hashSync(req.body.password, salt);

  try {
    const newUser = await User.create({
      email: req.body.email,
      password: passwordHash,
    });
    res.status(201).json({ message: "New user created", user: newUser._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ******* LOGIN ROUTE *******
router.post("/login", async (req, res) => {
  // TODO: Add input validation here, e.g. check if email is valid

  const potentialUser = await User.findOne({ email: req.body.email });
  if (potentialUser) {
    if (bcryptjs.compareSync(req.body.password, potentialUser.password)) {
      const authToken = jwt.sign(
        { userId: potentialUser._id },
        process.env.TOKEN_SECRET,
        {
          algorithm: "HS256",
          expiresIn: "6h",
        }
      );
      res.status(200).json(authToken);
    } else {
      res.status(401).json({ message: "Incorrect password" });
    }
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

// ******* VERIFY ROUTE *******
router.get("/verify/:userId", async (req, res) => {
  // isAuthenticated later
  const user = await User.findById(req.params.userId);
  if (user) {
    res.status(200).json({ message: "User is authenticated", user });
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

module.exports = router;
