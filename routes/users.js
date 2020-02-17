const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const fileUpload = require('../middleware/file-upload');

// Bring In The User Model
const User = require('../models/User');

// @route  POST api/users
// @desc   Register User
// @access Public
router.post(
	'/',
	fileUpload.single('image'),
	[
		check('name', 'Name Is Required')
			.not()
			.isEmpty(),
		check('email', 'Please Include A Valid E-Mail').isEmail(),
		check(
			'password',
			'Please Enter A Password With 6 or More Characters'
		).isLength({ min: 6 })
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const { name, email, password } = req.body;

		try {
			// SEE IF USER EXISTS
			let user = await User.findOne({ email: email });
			if (user) {
				return res
					.status(400)
					.json({ errors: [{ msg: 'User Already Exists' }] });
			}
			// GET USERS GRAVATAR
			const avatar = gravatar.url(email, {
				s: '200',
				r: 'pg',
				d: 'mm'
			});
			user = new User({
				name,
				email,
				avatar,
				password
			});
			// ENCRYPT PASSWORD
			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(password, salt);
			await user.save();
			// RETURN JASONWEBTOKEN
			const payload = {
				user: {
					id: user.id
				}
			};
			jwt.sign(
				payload,
				config.get('jwtSecret'),
				{ expiresIn: 3600000 },
				(err, token) => {
					if (err) throw err;
					// sends the token back to the client
					res.json({ token });
				}
			);
		} catch (error) {
			console.error(error.message);
			res.status(500).send('Server Error');
		}
	}
);

module.exports = router;
