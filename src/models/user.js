const mongoose = require('mongoose');
const { Schema } = mongoose;
const validator = require('validator');

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

const User = mongoose.model('User', userSchema);
module.exports = User;