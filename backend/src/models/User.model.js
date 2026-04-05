const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name:               { type: String, required: true, trim: true },
    email:              { type: String, required: true, unique: true, lowercase: true },
    password:           { type: String, required: true, minlength: 6, select: false },
    role:               { type: String, enum: ['user', 'admin'], default: 'user' },
    isEmailVerified:    { type: Boolean, default: true },
    emailVerifyToken:   { type: String },
    passwordResetToken: { type: String },
    passwordResetExp:   { type: Date },
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)