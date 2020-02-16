const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

// Bring In The User Model
const User = require('../models/User');

// @route  POST api/users
// @desc   Register User
// @access Public
router.post(
	'/',
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
				res.status(400).json({ errors: [{ msg: 'User Already Exists' }] });
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
			res.send('User Registered');
		} catch (error) {
			console.error(error.message);
			res.status(500).send('Server Error');
		}
	}
);

module.exports = router;
