// cloud-functions/healthCheck/index.js

/**
 * Simple HTTP function to verify serverless works.
 */
exports.healthCheck = (req, res) => {
  res
    .status(200)
    .json({
      message: "Serverless function is alive!",
      timestamp: new Date().toISOString()
    });
};
