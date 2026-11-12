
const prisma = require("../../database/prisma");

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function parsePositiveInteger(value, fieldName) {
  const number = Number(value);

  if (!Number.isSafeInteger(number) || number <= 0) {
    throw createError(`${fieldName} inválido.`, 400);
  }

  return number;
}

function priceToCents(price) {
  const value = Number(price);

  if (!Number.isFinite(value) || value < 0) {
    throw createError("Preço inválido no cadastro do prato.", 500);
  }

  return Math.round(value * 100);
}

async function createOrder(userId, items) {
  const id = parsePositiveInteger(userId, "Usuário");

  if (!Array.isArray(items) || items.length === 0) {
    throw createError("O pedido precisa conter pelo menos um prato.", 400);
  }

  if (items.length > 50) {
    throw createError("O pedido ultrapassou o limite de itens.", 400);
  }

  // Agrupa pratos repetidos e valida as quantidades.
  const quantities = new Map();

  for (const item of items) {
    if (!item || typeof item !== "object") {
      throw createError("Item do pedido inválido.", 400);
    }

    const dishId = parsePositiveInteger(item.dishId, "Prato");
    const quantity = parsePositiveInteger(item.quantity, "Quantidade");

    const newQuantity = (quantities.get(dishId) || 0) + quantity;

    if (newQuantity > 999) {
      throw createError("Quantidade máxima por prato excedida.", 400);
    }

    quantities.set(dishId, newQuantity);
  }

  return prisma.$transaction(async (tx) => {
    // Consulta os pratos e seus restaurantes diretamente no banco.
    const dishes = await tx.dish.findMany({
      where: {
        id: { in: Array.from(quantities.keys()) }
      },
      include: {
        restaurant: true
      }
    });

    if (dishes.length !== quantities.size) {
      throw createError("Um ou mais pratos não foram encontrados.", 404);
    }

    let totalCents = 0;

    const orderItems = dishes.map((dish) => {
      const quantity = quantities.get(dish.id);
      const unitPriceCents = priceToCents(dish.price);

      totalCents += unitPriceCents * quantity;

      return {
        dishId: dish.id,
        dishName: dish.name,
        restaurantId: dish.restaurantId,
        restaurantName: dish.restaurant.name,
        quantity,
        unitPrice: (unitPriceCents / 100).toFixed(2)
      };
    });

    if (!Number.isSafeInteger(totalCents)) {
      throw createError("Valor total do pedido inválido.", 400);
    }

    const total = (totalCents / 100).toFixed(2);

    // Cria o pedido e seus itens na mesma transação.
    return tx.order.create({
      data: {
        userId: id,
        total,
        status: "PENDING",
        items: {
          create: orderItems
        }
      },
      include: {
        items: true
      }
    });
  });
}

async function listOrders(userId) {
  const id = parsePositiveInteger(userId, "Usuário");

  return prisma.order.findMany({
    where: { userId: id },
    include: {
      items: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}

async function getOrderById(orderId, userId) {
  const id = parsePositiveInteger(orderId, "Pedido");
  const user = parsePositiveInteger(userId, "Usuário");

  const order = await prisma.order.findFirst({
    where: {
      id,
      userId: user
    },
    include: {
      items: true
    }
  });

  if (!order) {
    throw createError("Pedido não encontrado.", 404);
  }

  return order;
}

module.exports = {
  createOrder,
  listOrders,
  getOrderById
};
