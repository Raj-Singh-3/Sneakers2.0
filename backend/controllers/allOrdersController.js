export async function getSellerOrders(req, res) {
  try {
    const sellerId = req.user.id;

    const shipments = await shipments.find({ sellerId })
      .populate({
        path: 'orderId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      });

    res.status(200).json(shipments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
