const express = require("express");
const router = express.Router();
const db = require("../db");
const { jwtAuthMiddleware, generateToken } = require("./../jwt");

// signup
router.post("/signup", async (req, res) => {
  const {
    name,
    email,
    age,
    mobile_number,
    address,
    adhar_no,
    password,
    role,
    isVoted,
  } = req.body;

  try {
    const checkEmailQuery = "SELECT * FROM voating_user WHERE email=?";
    const [existingUser] = await db.promise().query(checkEmailQuery, [email]);

    if (existingUser.length > 0) {
      return res.status(409).json({ message: "email already exist" });
    }

    const checkAdharQuery = "SELECT * FROM voating_user WHERE adhar_no=?";
    const [existingAdhar] = await db
      .promise()
      .query(checkAdharQuery, [adhar_no]);

    if (existingAdhar.length > 0) {
      return res.status(409).json({ message: "Adhaar already exist" });
    }
    const insertQuery =
      "INSERT INTO voating_user (name,email,age,mobile_number,address,adhar_no,password,role,isVoted) VALUES (?,?,?,?,?,?,?,?,?)";

    const result = await db
      .promise()
      .query(insertQuery, [
        name,
        email,
        age,
        mobile_number,
        address,
        adhar_no,
        password,
        role,
        isVoted,
      ]);

    console.log("data inserted");
    const payload = {
      name: name,
      username: email,
    };
    console.log(JSON.stringify(payload));

    const token = generateToken(payload);
    console.log("token is : ", token);
    res.status(201).json({
      message: `user added succesfully ${name}`,
      userId: result.name,
    });
  } catch (error) {
    console.error("Error adding user:", error.message);
    res.status(500).json({ message: "Error adding user" });
  }
});

// login

router.post("/login", async (req, res) => {
  const { adhar_no, password } = req.body;

  try {
    const sqlQuery = `SELECT * FROM voating_user WHERE adhar_no = ?`;
    const [user] = await db.promise().query(sqlQuery, [adhar_no]);

    if (user.length === 0) {
      return res
        .status(401)
        .json({ message: "User not Found with this Adhar card" });
    }

    const data = user[0];

    if (data.password !== password) {
      return res.status(401).json({ message: "Incorrect password" });
    }
    console.log("data inserted", adhar_no);

    const payload = {
      adhar_no: adhar_no,
      userId: user[0].id,
    };
    console.log(JSON.stringify(payload));

    const token = generateToken(payload);
    console.log("token is : ", token);

    // If email and password match, return the user object
    return res.json(token);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const { adhar_no } = req.user;

    const sqlQuery = `SELECT name, email, id, mobile_number FROM voating_user WHERE adhar_no = ?`;
    // const sqlQuery = `SELECT id, name, email, mobile_number FROM voating_user WHERE adhar_no = ?`;
    const [userData] = await db.promise().query(sqlQuery, [adhar_no]);

    if (!userData[0]) {
      return res.status(400).json({ message: "No user data found" });
    }
    console.log(req.user.id);
    return res.json({
      message: "User profile fetched successfully",
      user: {
        name: userData[0].name,
        email: userData[0].email,
        phone: userData[0].mobile_number,
        adhar_no,
        id: userData[0].id,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    console.log("User ID:", userId);

    const { currentPassword, newPassword } = req.body;

    const [user] = await db
      .promise()
      .query(`SELECT password FROM voating_user WHERE id = ?`, [userId]);

    if (!user[0]) {
      console.log("User not found in the database");
      return res.status(404).json({ message: "User not found" });
    }

    if (user[0].password !== currentPassword) {
      return res.status(401).json({ message: "Incorrect current password" });
    }

    await db
      .promise()
      .query(`UPDATE voating_user SET password = ? WHERE id = ?`, [
        newPassword,
        userId,
      ]);

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
