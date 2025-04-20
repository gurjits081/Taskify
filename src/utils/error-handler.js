const errorHandler = (err, req, res, next) => {
    console.log("Error Handler:", err);

    const statusCode = err.statusCode || 500;
    const message = err.message || "Something went wrong";

    res.status(500).json({
        success: false,
        message
    });
};

export default errorHandler;