
const orderService = require("./order.service");

function handleError(res, error) {
  console.error("Erro no módulo de pedidos:", error);

  const status = error.statusCode || 500;

  return res.status(status).json({
    error: status === 500
      ? "Erro interno no servidor."
      : error.message
  });
}

async function create(req, res) {
  try {
    const order = await orderService.createOrder(
      req.user.id,
      req.body.items
    );

    return res.status(201).json(order);
  } catch (error) {
    return handleError(res, error);
  }
}

async function list(req, res) {
  try {
    const orders = await orderService.listOrders(req.user.id);

    return res.status(200).json(orders);
  } catch (error) {
    return handleError(res, error);
  }
}

async function getById(req, res) {
  try {
    const order = await orderService.getOrderById(
      req.params.orderId,
      req.user.id
    );

    return res.status(200).json(order);
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  create,
  list,
  getById
};
