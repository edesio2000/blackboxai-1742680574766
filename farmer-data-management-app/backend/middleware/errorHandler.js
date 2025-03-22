class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
        this.status = 400;
    }
}

class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
        this.status = 404;
    }
}

/**
 * Global error handling middleware
 * Formats and returns error responses consistently
 */
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // Default error
    let status = err.status || 500;
    let message = err.message || 'Internal Server Error';

    // Handle specific error types
    if (err instanceof ValidationError || err instanceof NotFoundError) {
        status = err.status;
        message = err.message;
    }

    res.status(status).json({
        error: {
            message,
            status,
            path: req.path
        }
    });
};

module.exports = {
    ValidationError,
    NotFoundError,
    errorHandler
};