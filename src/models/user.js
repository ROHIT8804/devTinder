const mongoose = require('mongoose');
const { Schema } = mongoose;

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
  }

},
{
  timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;