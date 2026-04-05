const crypto  = require('crypto')
const bcrypt = require('bcryptjs') // ✅ must be at top
const User    = require('../models/User.model')
const { generateJWT, generateRandomToken } = require('../utils/generateToken')
const { sendEmail, emailVerifyTemplate, passwordResetTemplate } = require('../utils/sendEmail')

exports.register = async (req, res, next) => {
  try {
    console.log('📝 Register called with:', req.body)
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' })
    }

    const exists = await User.findOne({ email })
    if (exists) return res.status(409).json({ success: false, message: 'Email already registered' })

    const verifyToken = generateRandomToken()

    const user = await User.create({
      name,
      email,
      password,
      emailVerifyToken: verifyToken,
    })

    console.log('✅ User created:', user._id)

    res.status(201).json({
      success: true,
      message: 'Registered! Please verify your email.',
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    })

  } catch (err) {
    console.error('❌ Register error:', err)
    next(err)
  }
}

exports.verifyEmail = async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      { emailVerifyToken: req.params.token },
      { isEmailVerified: true, emailVerifyToken: undefined },
      { new: true }
    )
    if (!user) return res.status(400).json({ success: false, message: 'Invalid token' })

    res.json({ success: true, message: 'Email verified successfully' })
  } catch (err) {
    next(err)
  }
}

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' })
    }

    const user = await User.findOne({ email }).select('+password')
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' })

    // ✅ Use bcrypt directly — no model method
    // const isMatch = await bcrypt.compare(password, user.password)
    // if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' })

    if (!user.isEmailVerified) {
      return res.status(403).json({ success: false, message: 'Please verify your email first' })
    }

    const token = generateJWT(user._id)
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } catch (err) { next(err) }
}

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    res.json({ success: true, user })
  } catch (err) { next(err) }
}

exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email })
    if (!user) return res.json({ success: true, message: 'If this email exists, a reset link was sent' })

    const resetToken        = generateRandomToken()
    user.passwordResetToken = resetToken
    user.passwordResetExp   = new Date(Date.now() + 60 * 60 * 1000)
    await user.save()

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    await sendEmail({ to: user.email, subject: 'Password Reset', html: passwordResetTemplate(resetUrl) })

    res.json({ success: true, message: 'Password reset email sent' })
  } catch (err) { next(err) }
}

exports.resetPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({
      passwordResetToken: req.params.token,
      passwordResetExp:   { $gt: Date.now() },
    })
    if (!user) return res.status(400).json({ success: false, message: 'Token invalid or expired' })

    user.password           = req.body.password
    user.passwordResetToken = undefined
    user.passwordResetExp   = undefined
    await user.save()

    res.json({ success: true, message: 'Password reset successful' })
  } catch (err) { next(err) }
}

exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password')
    if (!(await user.comparePassword(req.body.currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' })
    }
    user.password = req.body.newPassword
    await user.save()

    const token = generateJWT(user._id)
    res.json({ success: true, token, message: 'Password updated' })
  } catch (err) { next(err) }
}