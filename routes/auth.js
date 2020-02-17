const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

// Bring In The Auth MiddleWare
const auth = require('../middleware/auth');

// Bring In The User Model
const User = require('../models/User');

// @route  GET api/auth
// @desc   TEST route
// @access Public
router.get('/', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select('-password');
		res.json(user);
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server Error');
	}
});

// @route  POST api/auth
// @desc   Authenticate User And Get Token
// @access Public
router.post(
	'/',
	[
		check('email', 'Please Include A Valid E-Mail').isEmail(),
		check('password', 'Password Is Required').exists()
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const { email, password } = req.body;

		try {
			// SEE IF USER EXISTS
			let user = await User.findOne({ email: email });
			if (!user) {
				return res
					.status(400)
					.json({ errors: [{ msg: 'Invalid Credentials' }] });
			}
			// COMPARE USERS EMAIL AND PASSWORD
			const isMatch = await bcrypt.compare(password, user.password);
			if (!isMatch) {
				return res
					.status(400)
					.json({ errors: [{ msg: 'Invalid Credentials' }] });
			}
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
