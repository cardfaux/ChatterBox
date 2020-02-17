const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
	// GET TOKEN FROM THE HEADER
	const token = req.header('x-auth-token');
	// CHECK IF THERE IS NO TOKEN
	if (!token) {
		return res.status(401).json({ msg: 'No Token, Authorization Denied' });
	}
	// VERIFY TOKEN IF THERE IS ONE
	try {
		const decoded = jwt.verify(token, config.get('jwtSecret'));

		// Can Use This req.user In Any Protected Routes
		req.user = decoded.user;
		next();
	} catch (error) {
		res.status(401).json({ msg: 'Token Is Not Valid' });
	}
};
