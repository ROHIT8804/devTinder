const mongoose = require('mongoose');
const { Schema } = mongoose;
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String
  },
  emailId: {
    type: String,
    lowercase: true,
    required: true,
    unique: true,
    trim: true,
    // match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please enter a valid email address'],
    validate(value) {
      if(!validator.isEmail(value)) {
        throw new Error('Please enter a valid email address');
      }
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  age: {
    type: Number,
    min: 18
  },
  gender: {
    type: String,
    validate: {
      validator: function (value) {
        return ['male', 'female', 'other'].includes(value.toLowerCase());
      },
      message: props => `${props.value} is not a valid gender. Accepted values are: male, female, other.`
    }
  },
  skills: {
    type: [String],
    validate: {  
      validator: function (value) {
        return value.length <= 5;
      },
      message: 'You can only have a maximum of 5 skills.'
    }
  },

},
{
  timestamps: true
});

userSchema.methods.getJWT = async function() {
  const user = this;
  const token = await jwt.sign({ userId: user._id }, "devtTechSecretKey",{ expiresIn: "1h" } )

  return token;
} 

userSchema.methods.validatePassword = async function(password) {
  const user = this
  if (!user || !user.password) {
    throw new Error('User not found or password not set');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid password');
  } 
  return isPasswordValid;
}

const User = mongoose.model('User', userSchema);
module.exports = User;