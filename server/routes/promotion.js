// Apply points
if (usePoints) {
  const user = await User.findById(req.user.userId);
  if (user.points < usePoints) return res.status(400).json({ message: 'Not enough points' });
  discount += usePoints;
  await User.findByIdAndUpdate(req.user.userId, { $inc: { points: -usePoints } });
}

order.totalAmount = Math.max(0, order.totalAmount - discount);
await order.save();
const updatedOrder = await Order.findById(orderId);
res.json({ order: updatedOrder, discountApplied: discount }); 