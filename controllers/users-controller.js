const dbConnection = require('../dbConnection');
const bcrypt = require('bcryptjs');
const uploadPosts = require ('../middleware/profile-upload-middleware')
const emailValidator = require('../Globals/email-validator');
const { generateToken } = require('../Globals/token-validation');
const path = require('path');


exports.signUp = async (req, res) => {
    try {
        await uploadPosts(req, res);
        if (!emailValidator(req.body.email)) {
            return res.status(400).send({
                message: "Invalid Email Format"
            });
        }
        const [checkEmailUnique] = await dbConnection.execute(`SELECT * FROM users WHERE email = ?`, [req.body.email]);
        if (checkEmailUnique.length > 0) {
            return res.status(400).send({
                message: "email already registered"
            });
        }
        const {
            name, email, password, phone_number, address, date_of_birth, hire_date,
            designation, emergency_contact, emergency_contact_2
        } = req.body;

        const hashPass = await bcrypt.hash(password, 12);

        const [lastUser] = await dbConnection.execute(`SELECT user_id FROM users ORDER BY user_id DESC LIMIT 1`);
        let newUserId = '0001';
        if (lastUser.length > 0) {
            const lastUserId = parseInt(lastUser[0].user_id, 10);
            newUserId = String(lastUserId + 1).padStart(4, '0');
        }

               let profilePictureUrl = "";
            if (req.file) {
                profilePictureUrl = '/resources/static/assets/uploads/profiles/' + req.file.filename;
            }

            const signUpParams = [
                newUserId, name, email, hashPass, phone_number || "", address || "", date_of_birth || null,
                hire_date || null, designation || "", profilePictureUrl, emergency_contact || "",
                emergency_contact_2 || "", "", ""
            ];

            const [signUp] = await dbConnection.execute(
                `INSERT INTO users (user_id, name, email, password, phone_number, address, date_of_birth, hire_date, designation, profile_picture_url, emergency_contact, emergency_contact_2, access_token, refresh_token) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                signUpParams
            );               
                if (signUp.affectedRows == 1) {
                    return res.status(200).send({
                        message: "User added successfully"
                    })
                }else {
                    return res.status(500).json({
                        message: "Could not add user"
                    });
                }
            } catch (err) {
            res.status(500).send({
                failed:"failed",
                message: `${err}`,
            });
    }
}

exports.loginUser = async (req, res) => {
    var { email, password } = req.body;
    try {
        if (!emailValidator(req.body.email)) {
            return res.status(400).send({
                message: "Invalid Email Format"
            });
        }

        const [user] = await dbConnection.execute(`SELECT * FROM users WHERE email = ?`, [email]);
        if (user.length === 0) {
            return res.status(400).send({
                message: "Invalid email or password"
            });
        }

        const userData = user[0];

        const isPasswordValid = await bcrypt.compare(password, userData.password);
        if (!isPasswordValid) {
            return res.status(400).send({
                message: "Invalid email or password"
            });
        }


        const tokenResponse = await generateToken([userData]);

        return res.status(200).send({
            message: tokenResponse.data,
            access_token: tokenResponse.access_token,
            refresh_token: tokenResponse.refresh_token,
            user_data: tokenResponse.user_data
        });
    } catch (err) {
        return res.status(500).send({
            message: "Failed",
            error: err.message
        });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
      const [getAllUsers] = await dbConnection.execute(`SELECT id,user_id,name,email,phone_number,address,date_of_birth,designation,profile_picture_url,emergency_contact,emergency_contact_2,created_at,updated_at FROM users`);
      return res.status(200).json({
        message: "Supplier retrieved successfully",
        data: getAllUsers
      });
    } catch (err) {
      res.status(500).send({
        message: err.message
      });
    }
  };
  
