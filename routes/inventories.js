const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const inventorySchema = require('../schemas/inventories');

function validateProductAndQuantity(body) {
  const { product, quantity } = body || {};
  if (!product) return { ok: false, message: 'product is required' };
  if (!mongoose.Types.ObjectId.isValid(product)) {
    return { ok: false, message: 'product is not a valid ObjectId' };
  }
  const q = Number(quantity);
  if (!Number.isFinite(q) || q <= 0) {
    return { ok: false, message: 'quantity must be a positive number' };
  }
  return { ok: true, product, quantity: q };
}

// GET /api/v1/inventories -> all inventories (join with product)
router.get('/', async function (req, res, next) {
  const data = await inventorySchema
    .find({})
    .populate({ path: 'product' });
  res.send(data);
});

// GET /api/v1/inventories/:id -> inventory by inventoryId (join with product)
router.get('/:id', async function (req, res, next) {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).send({ message: 'ID NOT FOUND' });
    }
    let inv = await inventorySchema
      .findOne({ _id: id })
      .populate({ path: 'product' });
    if (!inv) {
      return res.status(404).send({ message: 'ID NOT FOUND' });
    }
    res.status(200).send(inv);
  } catch (error) {
    res.status(404).send({ message: 'ID NOT FOUND' });
  }
});

// POST /api/v1/inventories/add_stock
// body: { product, quantity } -> increase stock by quantity
router.post('/add_stock', async function (req, res, next) {
  const v = validateProductAndQuantity(req.body);
  if (!v.ok) return res.status(400).send({ message: v.message });

  const inv = await inventorySchema
    .findOneAndUpdate(
      { product: v.product },
      { $inc: { stock: v.quantity } },
      { new: true }
    )
    .populate({ path: 'product' });

  if (!inv) return res.status(404).send({ message: 'Inventory not found' });
  res.status(200).send(inv);
});

// POST /api/v1/inventories/remove_stock
// body: { product, quantity } -> decrease stock by quantity
router.post('/remove_stock', async function (req, res, next) {
  const v = validateProductAndQuantity(req.body);
  if (!v.ok) return res.status(400).send({ message: v.message });

  const inv = await inventorySchema
    .findOneAndUpdate(
      { product: v.product, stock: { $gte: v.quantity } },
      { $inc: { stock: -v.quantity } },
      { new: true }
    )
    .populate({ path: 'product' });

  if (!inv) {
    return res.status(400).send({ message: 'Not enough stock (stock must be >= quantity)' });
  }
  res.status(200).send(inv);
});

// POST /api/v1/inventories/reservation
// body: { product, quantity } -> stock -= quantity; reserved += quantity
router.post('/reservation', async function (req, res, next) {
  const v = validateProductAndQuantity(req.body);
  if (!v.ok) return res.status(400).send({ message: v.message });

  const inv = await inventorySchema
    .findOneAndUpdate(
      { product: v.product, stock: { $gte: v.quantity } },
      { $inc: { stock: -v.quantity, reserved: v.quantity } },
      { new: true }
    )
    .populate({ path: 'product' });

  if (!inv) {
    return res.status(400).send({ message: 'Not enough stock to reserve' });
  }
  res.status(200).send(inv);
});

// POST /api/v1/inventories/sold
// body: { product, quantity } -> reserved -= quantity; soldCount += quantity
router.post('/sold', async function (req, res, next) {
  const v = validateProductAndQuantity(req.body);
  if (!v.ok) return res.status(400).send({ message: v.message });

  const inv = await inventorySchema
    .findOneAndUpdate(
      { product: v.product, reserved: { $gte: v.quantity } },
      { $inc: { reserved: -v.quantity, soldCount: v.quantity } },
      { new: true }
    )
    .populate({ path: 'product' });

  if (!inv) {
    return res.status(400).send({ message: 'Not enough reserved quantity to sell' });
  }
  res.status(200).send(inv);
});

module.exports = router;

