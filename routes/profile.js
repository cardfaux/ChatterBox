const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const Profile = require('../models/Profile');
const User = require('../models/User');

// @route  GET api/profile/me
// @desc   Get Current Users Profile
// @access Private
router.get('/me', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({
			user: req.user.id
		}).populate('user', ['name', 'avatar', 'image']);

		if (!profile) {
			return res.status(400).json({ msg: 'There Is No Profile For This User' });
		}

		res.json(profile);
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server Error');
	}
});

module.exports = router;
