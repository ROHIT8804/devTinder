const validator = require("validator");

const validateSignUpData = (data) => {
    const { firstName, lastName, emailId, password} = data;

    if(!firstName ){
        throw new Error("First name is required");
    }
    else if(validator.isEmail(emailId) === false){
        throw new Error("Please enter a valid email address");
    }
    else if(validator.isStrongPassword(password, { minLength: 6 }) === false){
        throw new Error("Password must be at least 6 characters long and contain a mix of letters, numbers, and symbols");
    }
}

module.exports = validateSignUpData;