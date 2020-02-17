const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

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

// @route  POST api/profile
// @desc   Create Or Update User Profile
// @access Private
router.post(
	'/',
	[
		auth,
		[
			check('bio', 'Bio Is Required')
				.not()
				.isEmpty(),
			check('location', 'Location Is Required')
				.not()
				.isEmpty()
		]
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const {
			bio,
			status,
			location,
			githubusername,
			youtube,
			facebook,
			twitter,
			instagram,
			linkedin
		} = req.body;

		// BUILD PROFILE OBJECT
		const profileFields = {};
		profileFields.user = req.user.id;
		if (bio) profileFields.bio = bio;
		if (status) profileFields.status = status;
		if (location) profileFields.location = location;
		if (githubusername) profileFields.githubusername = githubusername;
		// BUILD SOCIAL OBJECT
		profileFields.social = {};
		if (youtube) profileFields.social.youtube = youtube;
		if (facebook) profileFields.social.facebook = facebook;
		if (twitter) profileFields.social.twitter = twitter;
		if (instagram) profileFields.social.instagram = instagram;
		if (linkedin) profileFields.social.linkedin = linkedin;

		try {
			let profile = await Profile.findOne({ user: req.user.id });

			if (profile) {
				// UPDATE PROFILE
				profile = await Profile.findOneAndUpdate(
					{ user: req.user.id },
					{ $set: profileFields },
					{ new: true }
				);

				return res.json(profile);
			}

			// CREATE PROFILE IF ONE IS NOT FOUND TO UPDATE
			profile = new Profile(profileFields);

			await profile.save();
			res.json(profile);
		} catch (error) {
			console.error(error.message);
			res.status(500).send('Server Error');
		}
	}
);

module.exports = router;
