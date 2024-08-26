const { validationResult } = require("express-validator");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const shortid = require("shortid");

exports.signup = (req, res) => {
    User.findOne({ email: req.body.email })
        .then(async (user) => {
            if (user)
                return res.status(400).json({
                    message: "User already exists",
                });
            const { firstName, lastName, email, password } = req.body;
            const hash_password = await bcrypt.hash(password, 10);
            const _user = new User({
                firstName,
                lastName,
                email,
                hash_password,
                userName: shortid.generate(),
            });
            _user
                .save()
                .then((data) => {
                    if (data) {
                        return res.status(201).json({
                            message: "user created successfully",
                        });
                    }
                })
                .catch(() => {
                    return res.status(400).json({
                        message: "something wrong with the database",
                    });
                });
        })
        .catch((err) => {
            console.log("error occured in finding the email id from database", err);
        });
};

exports.signin = (req, res) => {
    User.findOne({ email: req.body.email })
        .then(async (user) => {
            if (user) {
                const isPassword = await user.authenticate(req.body.password);
                console.log(isPassword);
                if (isPassword) {
                    const token = jwt.sign({ _id: user.id }, process.env.JWT_SECRET, {
                        expiresIn: "1h",
                    });
                    const { _id, firstName, lastName, email, role, fullName } = user;
                    res.status(200).json({
                        token,
                        user: {
                            _id,
                            firstName,
                            lastName,
                            email,
                            role,
                            fullName,
                        },
                    });
                } else {
                    return res.status(404).json({
                        message: "Something went wrong",
                    });
                }
            } else {
                return res.status(400).json({ message: "Something went wrong" });
            }
        })
        .catch((err) => {
            res.status(400).json({ message: err.toString() });
        });
};
