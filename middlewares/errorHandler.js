export const errorHandler = (err, req, res, next) => {
    console.log(err.message);

    const statusCode = err.statusCode || res.statusCode || 500;
    
    res.status(statusCode).json({
        success: false,
        error: {
            code: statusCode,
            message: err.message || 'Something went wrong',
            details: err.details || undefined,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        }
    });
};