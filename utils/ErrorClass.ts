class ErrorClass extends Error {
    statusCode: Number;
    status: string;
    isOperational: Boolean
    
    constructor(message: string, statusCode: Number) {
        super(message)
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "Fail" : "Error";
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}


export default ErrorClass