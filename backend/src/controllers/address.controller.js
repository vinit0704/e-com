const Address = require('../models/Address.model')

exports.getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1 })
    res.json({ success: true, addresses })
  } catch (err) { next(err) }
}

exports.addAddress = async (req, res, next) => {
  try {
    const { isDefault } = req.body

    // If setting as default, unset others
    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false })
    }

    const address = await Address.create({ ...req.body, user: req.user._id })
    res.status(201).json({ success: true, address })
  } catch (err) { next(err) }
}

exports.updateAddress = async (req, res, next) => {
  try {
    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false })
    }
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    )
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' })
    res.json({ success: true, address })
  } catch (err) { next(err) }
}

exports.deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id })
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' })
    res.json({ success: true, message: 'Address deleted' })
  } catch (err) { next(err) }
}

exports.setDefault = async (req, res, next) => {
  try {
    await Address.updateMany({ user: req.user._id }, { isDefault: false })
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isDefault: true },
      { new: true }
    )
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' })
    res.json({ success: true, address })
  } catch (err) { next(err) }
}