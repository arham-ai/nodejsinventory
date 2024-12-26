const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const validator = require('validator');
const dbconnection = require('../dbConnection');
const { json } = require('body-parser');
const dbConnection = require('../dbConnection');
const uploadAttachmentsMiddleware = require('../middleware/upload-middleware');
const { removeUploadedFile } = require('./inventory-controller');
const uploadProfilesMiddleware = require('../middleware/profile-upload-middleware');

exports.signUp = async (req, res) => {
    try {
        
        await uploadAttachmentsMiddleware(req, res);
        console.log("recieved request body",req.body);
      const { first_name, email, password, phone_no, address, dob, admission_date, emergency_contact } = req.body;
  
      // Validate all required fields
      if (!first_name || !email || !password || !phone_no || !address || !dob || !admission_date || !emergency_contact) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      // Validate email format
      if (!validator.isEmail(email)) {
        return res.status(400).json({ message: "Invalid Email Format" });
      }
  
      // Check if email or username already exists
      const [checkEmail] = await dbConnection.execute('SELECT * FROM std_account WHERE email = ?', [email]);
      if (checkEmail.length > 0) {
        return res.status(409).json({ message: "Email already taken" });
      }
  
      const [checkFirstName] = await dbConnection.execute('SELECT * FROM std_account WHERE first_name = ?', [first_name]);
      if (checkFirstName.length > 0) {
        return res.status(409).json({ message: "Username already taken" });
      }
  
      // Hash the password
      const hashPass = await bcrypt.hash(String(password), 12);
  
      // Generate an OTP
      const otp = Math.floor(100000 + Math.random() * 900000);
  
      // Handle file uploads
  
      // Debugging uploaded file
      console.log("Uploaded Files:", req.files);
  
      // Get the uploaded profile picture's URL
      let profilePictureUrl = req.files?.profile_picture
        ? "/resources/static/assets/uploads/profiles/" + req.files.profile_picture[0].filename
        : null;
  
      if (!profilePictureUrl) {
        console.error("Profile Picture URL is null. Please ensure the file is being uploaded correctly.");
        return res.status(400).json({ message: "Profile picture upload failed. Please try again." });
      }
  
      // Debugging profilePictureUrl
      console.log("Generated Profile Picture URL:", profilePictureUrl);
  
      // Insert user details and profile picture URL into the database
      const [result] = await dbConnection.execute(
        `INSERT INTO std_account (first_name, email, password, phone_no, address, dob, admission_date, emergency_contact, otp, otp_verified, profile_picture_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          first_name,
          email,
          hashPass,
          phone_no,
          address,
          dob,
          admission_date,
          emergency_contact,
          otp,
          false,
          profilePictureUrl, // Pass the generated URL here
        ]
      );
  
      // Debugging insert result
      console.log("Insert Result:", result);
  
      // Send OTP to the user via email
      const transporter = nodemailer.createTransport({
        port: 465,
        host: 'secure353.inmotionhosting.com',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
  
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Verify Your Account - OTP",
        text: `Your OTP for account verification is: ${otp}`,
      };
  
      await transporter.sendMail(mailOptions);
  
      // Respond success
      return res.status(201).json({
        message: "User registered successfully. Please verify the OTP sent to your email.",
        profilePictureUrl, // Include the profile picture URL in the response for debugging
      });
    } catch (err) {
      console.error("Signup Error:", err);
  
      return res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
  };
      
  
exports.login = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        if (!identifier || !password) {
            return res.status(400).json({ message: "Identifier and Password are required" });
        }
        const isEmail = identifier.includes('@');
        let query = 'SELECT * FROM std_account WHERE ';
        let params = [];
        if (isEmail) {
            query += 'email = ?';
            params.push(identifier);
            if (!validator.isEmail(identifier)) {
                return res.status(400).json({ message: "Invalid Email Format" });
            }
        } else {
            query += 'first_name = ?';
            params.push(identifier);
        }
        console.log("Query:", query);
        console.log("Params:", params);
        const [user] = await dbConnection.execute(query, params);
        if (user.length === 0) {
            return res.status(404).json({ message: "User not found or invalid credentials" });
        }
        const userData = user[0];
        const isPasswordValid = await bcrypt.compare(String(password), userData.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        if (!userData.otp_verified) {
            return res.status(403).json({ message: "OTP not verified. Please verify to log in." });
        }
        return res.status(200).json({
            message: "Login successful",
            user_data: {
                id: userData.id,
                email: userData.email,
                phone_no: userData.phone_no,
                first_name: userData.first_name,
            },
        });
    } catch (err) {
        console.error("Login Error:", err);
        return res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};


exports.verifyOTP = async (req, res) => {
    try {
        const { email, OTP } = req.body;

        if (!email || !OTP) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        const [user] = await dbConnection.execute('SELECT * FROM std_account WHERE email = ?', [email]);

        if (user.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const userData = user[0];

        if (userData.otp !== parseInt(OTP)) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        await dbConnection.execute(
            `UPDATE std_account SET otp_verified = true, updated_at = CURRENT_TIMESTAMP WHERE email = ?`,
            [email]
        );

        return res.status(200).json({ message: "OTP verified successfully" });

        // if ( otp_verified = 1){
        //     return res.status(409).json({message:"otp already given"});
        //     await dbConnection.execute(
        //         `insert into std_account (otp)`,
        //         [email]
        //     );
        // }
        
        await dbConnection.execute(
            `UPDATE std_account SET otp = ? WHERE email = ?`,
            [OTP, email]
        );



    } catch (err) {
        console.error("OTP Verification Error:", err);
        return res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

exports.uploadfile = async (req, res) => {
  await uploadAttachmentsMiddleware(req, res);

  let filePathToRemove = req.files?.profile_picture
    ? req.files.profile_picture[0]?.path
    : null;

  try {
    let profilePictureUrl = req.files?.profile_picture
      ? "/resources/static/assets/uploads/profiles/" + req.files.profile_picture[0].filename
      : "";
    await dbConnection.execute(
      `UPDATE std_account SET profile_picture_url = ? where id = 1`,
      [profilePictureUrl]
    );
    return res.status(201).json({ message: "profile picture updated successfully",URL : profilePictureUrl });
  }
  catch (err) {
    console.error(err);
    if (filePathToRemove !== null) {
      await removeFailedAttachment(filePathToRemove); // Ensure you have this helper function to remove failed uploads
    }
    return res.status(500).json({ message: "An error occurred while updating the profile picture" });
  }
};


exports.update = async (req, res) => {
  try {
    await uploadAttachmentsMiddleware
    (req, res);
    const {
      id,
      first_name,
      email,
      phone_no,
      address,
      dob,
      admission_date,
      emergency_contact,
    } = req.body;
    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }
    const [user] = await dbConnection.execute("SELECT * FROM std_account WHERE email = ? AND id <> ?", [email, id]);
    if (user.length > 0) {
      return res.status(409).send({ message: "Email already taken" });
    }
    const updateFields = [];
    const updateValues = [];
    if (first_name) {
      updateFields.push("first_name = ?");
      updateValues.push(first_name);
    }
    if (email) {
      updateFields.push("email = ?");
      updateValues.push(email);
    }
    if (phone_no) {
      updateFields.push("phone_no = ?");
      updateValues.push(phone_no);
    }
    if (address) {
      updateFields.push("address = ?");
      updateValues.push(address);
    }
    if (dob) {
      updateFields.push("dob = ?");
      updateValues.push(dob);
    }
    if (admission_date) {
      updateFields.push("admission_date = ?");
      updateValues.push(admission_date);
    }
    if (emergency_contact) {
      updateFields.push("emergency_contact = ?");
      updateValues.push(emergency_contact);
    }
    const [checkEmail] = await dbConnection.execute("SELECT * FROM std_account WHERE id = ?", [id]);
    console.log(checkEmail[0].profile_picture_url, 'PREVIOUS PICTURE');
    let newProfilePictureUrl = ""; // Default to existing picture URL
    console.log(req.files, 'OOOOOOOOOOOO')
    if (req.files && req.files.profile_picture[0].filename) {
      newProfilePictureUrl = `/resources/static/assets/uploads/profiles/${req.files.profile_picture[0].filename}`;
    var profile_picture = checkEmail[0].profile_picture_url
    }
    console.log(newProfilePictureUrl, 'NPPPPPPP');
    removeUploadedFile(profile_picture)
    updateFields.push("profile_picture_url = ?");
    updateValues.push(newProfilePictureUrl);
    if (updateFields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }
    updateValues.push(id);
    const sqlQuery = `UPDATE std_account SET ${updateFields.join(", ")} WHERE id = ?`;
    console.log("SQL Query:", sqlQuery, updateValues);
    const [result] = await dbConnection.execute(sqlQuery, updateValues);
    console.log("Update Result:", result);
    return res.status(200).json({
      message: "User updated successfully.",
      result,
    });
  } catch (err) {
    console.error("Update Error:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};
  
          

exports.resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        if ( otp_verified = 1){
            return res.status(409).json({message:"otp already given"});
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "Invalid Email Format" });
        }
        const [userData] = await dbConnection.execute('SELECT * FROM std_account WHERE email = ?', [email]);
        if (userData.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        const user = userData[0];
        

        const otp = Math.floor(100000 + Math.random() * 900000);
        await dbConnection.execute(
            'UPDATE std_account SET otp = ?, otp_verified = ? WHERE email = ?',
            [otp, false, email]
        );
        const transporter = nodemailer.createTransport({
            host: 'secure353.inmotionhosting.com',
            port: 465,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            },
        });
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Resend OTP - Verify Your Account",
            text: `Your new OTP for account verification is: ${otp}`
        };
        await transporter.sendMail(mailOptions);
        return res.status(200).json({
            message: "OTP resent successfully. Please check your email.",
            otp 
        });

    } catch (err) {
        console.error("Resend OTP Error:", err);
        return res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

