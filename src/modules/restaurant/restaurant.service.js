const prisma = require("../../database/prisma");
const emailService = require("../shared/email.service");
const activityService = require("../shared/activity.service");

// Para quem o comercial recebe os avisos (no futuro, virá do .env ou do banco)
const COMERCIAL_EMAIL = "felipe.oliveira@pro.fecaf.com.br";

async function listRestaurants() {
  const restaurants = await prisma.restaurant.findMany({
    include: {
      dishes: {
        orderBy: {
          id: "asc"
        },
        select: {
          imageUrl: true
        }
      }
    }
  });

  return restaurants.map((restaurant) => ({
    ...restaurant,
    imageUrl: restaurant.dishes.find(
      (dish) => dish.imageUrl && dish.imageUrl.trim() !== ""
    )?.imageUrl || ""
  }));
}

async function createRestaurant(data, user) {
  // 1) O que realmente importa: cadastrar o restaurante
  const restaurant = await prisma.restaurant.create({
    data: {
      name: data.name,
      category: data.category,
      rating: data.rating || 0,
      ownerId: user.id // grava o dono (quem está logado, vindo do token)
    }
  });

  // 2) Ações secundárias — cada uma isolada por try/catch.
  // Se qualquer uma falhar, o cadastro NÃO é afetado.

  // E-mail de boas-vindas
  try {
    await emailService.sendEmail({
      to: user.email,
      toName: restaurant.name,
      subject: `Bem-vindo à EasyFood, ${restaurant.name}!`,
      header: `Olá, ${restaurant.name}!`,
      body: `Seu restaurante <strong>${restaurant.name}</strong> foi cadastrado com sucesso na EasyFood. Categoria: ${restaurant.category}.`,
      footer: "Equipe EasyFood"
    });
  } catch (error) {
    console.error("Erro ao enviar e-mail de boas-vindas:", error.message);
  }

  // Registro da atividade
  try {
    await activityService.log(
      "RESTAURANT_CREATED",
      `Restaurante: ${restaurant.name}`
    );
  } catch (error) {
    console.error("Erro ao registrar atividade:", error.message);
  }

  // Alerta para o comercial
  try {
    await emailService.sendEmail({
      to: COMERCIAL_EMAIL,
      toName: "Comercial EasyFood",
      subject: `Novo restaurante cadastrado: ${restaurant.name}`,
      header: "Novo restaurante na plataforma",
      body: `Nome: ${restaurant.name}<br/>Categoria: ${restaurant.category}<br/>Avaliação: ${restaurant.rating}`,
      footer: "Notificação automática — EasyFood"
    });
  } catch (error) {
    console.error("Erro ao notificar o comercial:", error.message);
  }

  // 3) O restaurante volta independente do resultado das ações acima
  return restaurant;
}

module.exports = {
  listRestaurants,
  createRestaurant
};