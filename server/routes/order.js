router.post('/', authMiddleware, async (req, res) => {
  try {
    const { paymentMethod, shippingInfo, note, promotionCode, usePoints } = req.body;

    if (!paymentMethod || !shippingInfo) {
      return res.status(400).json({
        success: false,
        message: 'Payment method and shipping info are required'
      });
    }

    // Validate shipping info
    if (!shippingInfo.address || !shippingInfo.phone || !shippingInfo.name) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping information is required'
      });
    }

    // Find the user's cart and populate product details
    const cart = await Cart.findOne({ userId: req.user.userId }).populate('items.productId');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Prepare items from cart and validate stock
    const items = [];
    let totalAmount = 0;

    for (const item of cart.items) {
      if (!item.productId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product in cart'
        });
      }

      if (item.productId.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${item.productId.name}. Available: ${item.productId.stockQuantity}`
        });
      }

      const itemTotal = item.productId.price * item.quantity;
      totalAmount += itemTotal;

      items.push({
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.productId.price,
        name: item.productId.name,
        total: itemTotal
      });
    }

    // --- DISCOUNT LOGIC ---
    let discount = 0;
    let discountType = null;
    let appliedCode = null;
    let discountSource = null;
    let discountAmount = 0;
    let finalAmount = totalAmount;

    // 1. Check for promotion
    if (promotionCode) {
      const Promotion = require('../models/Promotion');
      const now = new Date();
      const promo = await Promotion.findOne({
        code: promotionCode,
        expiresAt: { $gt: now },
        $or: [ { userId: req.user.userId }, { userId: null } ]
      });
      if (!promo) {
        return res.status(400).json({ success: false, message: 'Invalid or expired promotion code' });
      }
      if (promo.minOrderValue && totalAmount < promo.minOrderValue) {
        return res.status(400).json({ success: false, message: 'Order does not meet minimum value for promotion' });
      }
      discount = promo.discount;
      discountType = promo.type;
      appliedCode = promo.code;
      discountSource = 'promotion';
      // If user-specific, delete after use
      if (promo.userId) {
        await Promotion.deleteOne({ _id: promo._id });
      }
    }

    // 2. Apply discount
    if (discount) {
      if (discountType === 'percent') {
        discountAmount = totalAmount * (discount / 100);
        finalAmount = totalAmount - discountAmount;
      } else if (discountType === 'fixed') {
        discountAmount = discount;
        finalAmount = Math.max(0, totalAmount - discountAmount);
      }
    }

    // 3. Apply points
    if (usePoints) {
      const User = require('../models/User');
      const user = await User.findById(req.user.userId);
      if (user.points < usePoints) return res.status(400).json({ success: false, message: 'Not enough points' });
      discountSource = discountSource ? discountSource + '+points' : 'points';
      discountAmount += Number(usePoints);
      finalAmount = Math.max(0, finalAmount - Number(usePoints));
      await User.findByIdAndUpdate(req.user.userId, { $inc: { points: -Number(usePoints) } });
    }

    // --- END DISCOUNT LOGIC ---

    // Create the order with discount info
    const order = await Order.create({
      userId: req.user.userId,
      items,
      totalAmount: finalAmount,
      paymentMethod,
      shippingInfo,
      note: note || '',
      status: 'NEW',
      orderNumber: `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`,
      discount: discountAmount || 0,
      discountCode: appliedCode || null,
      discountSource: discountSource || null,
      statusHistory: [{
        status: 'NEW',
        timestamp: new Date(),
        note: 'Order placed successfully'
      }]
    });

    // Update product stock and purchase count
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { 
          stockQuantity: -item.quantity,
          purchaseCount: item.quantity 
        }
      });
    }

    // Clear the cart
    await Cart.deleteOne({ userId: req.user.userId });

    // Schedule automatic order confirmation after 30 minutes
    setTimeout(async () => {
      try {
        const currentOrder = await Order.findById(order._id);
        if (currentOrder && currentOrder.status === 'NEW') {
          currentOrder.status = 'CONFIRMED';
          currentOrder.statusHistory.push({
            status: 'CONFIRMED',
            timestamp: new Date(),
            note: 'Order automatically confirmed after 30 minutes'
          });
          await currentOrder.save();
        }
      } catch (error) {
        console.error('Error in automatic order confirmation:', error);
      }
    }, 30 * 60 * 1000); // 30 minutes

    // Populate the response with product details
    const populatedOrder = await Order.findById(order._id)
      .populate('items.productId', 'name price image')
      .populate('userId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: populatedOrder
    });
  } catch (error) {
    console.error('Error in create order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
}); 