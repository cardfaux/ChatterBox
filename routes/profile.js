const express = require('express');
const router = express.Router();
const config = require('config');
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

// @route  Get api/profile
// @desc   Get All Profiles
// @access Public
router.get('/', async (req, res) => {
	try {
		const profiles = await Profile.find().populate('user', ['name', 'avatar']);
		res.json(profiles);
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server Error');
	}
});

// @route  Get api/profile/user/:user_id
// @desc   Get Profile By User Id
// @access Public
router.get('/user/:user_id', async (req, res) => {
	try {
		// REQ.PARAMS.USER_ID GETS THE USER ID FROM THE PARAMS IN THE URL
		const profile = await Profile.findOne({
			user: req.params.user_id
		}).populate('user', ['name', 'avatar']);

		if (!profile) return res.status(400).json({ msg: 'Profile Not Found' });
		res.json(profile);
	} catch (error) {
		console.error(error.message);
		if (error.kind == 'ObjectId') {
			return res.status(400).json({ msg: 'Profile Not Found' });
		}
		res.status(500).send('Server Error');
	}
});

// @route  DELETE api/profile
// @desc   Delete Profile, User, and Posts
// @access Private
router.delete('/', auth, async (req, res) => {
	try {
		//@todo- REMOVE USERS POSTS

		// REMOVE PROFILE
		await Profile.findOneAndRemove({ user: req.user.id });
		// REMOVE THE USER
		await User.findOneAndRemove({ _id: req.user.id });

		res.json({ msg: 'User Has Been Deleted' });
	} catch (error) {
		console.error(error.message);
		res.status(500).send('Server Error');
	}
});

// @route    GET api/profile/github/:username
// @desc     Get user repos from Github
// @access   Public
router.get('/github/:username', (req, res) => {
	try {
		const options = {
			uri: encodeURI(
				`https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
			),
			method: 'GET',
			headers: {
				'user-agent': 'node.js',
				Authorization: `token ${config.get('githubToken')}`
			}
		};

		request(options, (error, response, body) => {
			if (error) console.error(error);

			if (response.statusCode !== 200) {
				return res.status(404).json({ msg: 'No Github profile found' });
			}

			res.json(JSON.parse(body));
		});
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

module.exports = router;
