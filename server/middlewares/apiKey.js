const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey && apiKey === process.env.API_KEY) {
    next();
  } else {
    res.status(401).json({
      status: 'fail',
      message: 'Unauthorized: Missing or invalid API Key.',
    });
  }
};

module.exports = apiKeyMiddleware;
