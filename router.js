const express = require("express");
const router = express.Router();
const db = require("./db");
const { signupValidation, loginValidation } = require("./validate");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/register", signupValidation, (req, res, next) => {
  db.query(
    `SELECT * FROM users WHERE LOWER(email) = LOWER(${db.escape(
      req.body.email
    )});`,
    (err, result) => {
      if (result.length) {
        return res.status(409).send({
          msg: "User already exist!",
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).send({
              msg: err,
            });
          } else {
            db.query(
              `INSERT INTO users (firstName, lastName, email, password) VALUES ('${
                req.body.firstName
              }',${db.escape(req.body.lastName)}, ${db.escape(req.body.email)}, ${db.escape(hash)})`,
              (err, result) => {
                if (err) {
                  throw err;
                  return res.status(400).send({
                    msg: err,
                  });
                }
                return res.status(201).send({
                  msg: "User registred successfully",
                });
              }
            );
          }
        });
      }
    }
  );
});

router.post("/login", loginValidation, (req, res, next) => {
  db.query(
    `SELECT * FROM users WHERE email = ${db.escape(req.body.email)};`,
    (err, result) => {
      console.log(result)
      if (err) {
        throw err;
        return res.status(400).send({
          msg: err,
        });
      }
      if (!result.length) {
        return res.status(401).send({
          msg: "Email or password is incorrect!",
        });
      }
      console.log(req.body.password, result[0]["passWord"])
      bcrypt.compare(
        req.body.password,
        result[0]["passWord"],
        (bErr, bResult) => {
            console.log(bErr)
          if (bErr) {
            throw bErr;
            return res.status(401).send({
              msg: "Email or password is incorrect!",
            });
          }
          if (bResult) {
            const token = jwt.sign(
              { id: result[0].id },
              "the-super-strong-secrect",
              { expiresIn: "1h" }
            );
            return res.status(200).send({
              msg: "Logged in!",
              token,
              user: result[0],
            });
          }
          return res.status(401).send({
            msg: "Email or password is incorrect!",
          });
        }
      );
    }
  );
});

router.post("/getUser", signupValidation, (req, res, next) => {
  if (
    !req.headers.authorization
  ) {
    return res.status(422).json({
      message: "Please provide the token",
    });
  }
  const theToken = req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(theToken, "the-super-strong-secrect");
  db.query(
    "SELECT * FROM users where id=?",
    decoded.id,
    function (error, results, fields) {
      if (error) throw error;
      console.log(results)
      console.log(results[0].userType)
      if (results[0].userType == 'admin')  {
        return res.send({
            error: false,
            data: results[0],
            message: "Fetch Successfully.",
          });
      } else {
        return res.status(422).json({
            message: "Access denied",
          });
      }

    }
  );
});
module.exports = router;
