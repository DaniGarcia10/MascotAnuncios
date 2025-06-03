const functions = require("firebase-functions");
const stripe = require("stripe")("sk_test_51RUVOtEFlPjTfgQFtvivM7BgJLNIOSQf9tVlbtg4A6cEwb0vg53Mau7IUU9v9JJpx9e2OKgJsgIoORPKR8i1FKvx007abwYG1Z"); // clave secreta de Stripe
const cors = require("cors")({ origin: true });

exports.createCheckoutSession = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      // Recoge duracion del body
      const { precio, duracion } = req.body;

      // Asegúrate de que duracion tenga valor
      if (!duracion) {
        return res.status(400).json({ error: 'Falta la duración' });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: "Pago de publicación de anuncio",
              },
              unit_amount: Math.round(precio * 100), // En céntimos
            },
            quantity: 1,
          },
        ],
        //duracion
        success_url: `http://localhost:4200/pago-exitoso?duracion=${duracion}`,
        cancel_url: "http://localhost:4200/pago-cancelado",
      });

      res.status(200).json({ url: session.url });
    } catch (error) {
      console.error("Stripe error:", error);
      res.status(500).json({ error: error.message });
    }
  });
});