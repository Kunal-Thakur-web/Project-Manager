class ApiError extends Error { //Inheriting from the predefined error class in nodejs
    constructor(statusCode, message = "Something went wrong", errors = [], stack = "") {
        super(message); // you call the constructor of the parent class using super
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;
        if(stack) {
            this.stack = stack;
        }
        else{
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export {ApiError};