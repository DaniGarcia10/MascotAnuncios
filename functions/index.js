require('dotenv').config();
const functions = require("firebase-functions");
const stripe = require("stripe")("sk_test_51RUVOtEFlPjTfgQFtvivM7BgJLNIOSQf9tVlbtg4A6cEwb0vg53Mau7IUU9v9JJpx9e2OKgJsgIoORPKR8i1FKvx007abwYG1Z"); // clave secreta de Stripe
const cors = require("cors")({ origin: true });
const admin = require("firebase-admin");
if (!admin.apps.length) admin.initializeApp();

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_0KxDd5JmsnwJ3nycQrAMP8pCnKjYi6ux';

exports.createCheckoutSession = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      // Recoge duracion del body
      const { precio, duracion, id_pago } = req.body; 

      // Asegúrate de que duracion tenga valor
      if (!duracion) {
        return res.status(400).json({ error: 'Falta la duración' });
      }

      if (!id_pago) {
        return res.status(400).json({ error: 'Falta el id_pago' });
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
              unit_amount: Math.round(precio * 100), 
            },
            quantity: 1,
          },
        ],
        metadata: { id_pago }, 
        //duracion
        success_url: `http://localhost:4200/pago-exitoso?id_pago=${id_pago}`,
        cancel_url: "http://localhost:4200/pago-cancelado",
      });

      res.status(200).json({ url: session.url });
    } catch (error) {
      console.error("Stripe error:", error);
      res.status(500).json({ error: error.message });
    }
  });
});

exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("🟢 Webhook recibido:", event.type);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    console.log("📦 session.metadata:", session.metadata);
    const id_pago = session.metadata?.id_pago;

    if (id_pago) {
      try {
        await admin.firestore().collection('pagos').doc(id_pago).update({
          pagado: true
        });
        console.log(`✅ Pago ${id_pago} marcado como pagado.`);
      } catch (err) {
        console.error(`❌ Error al actualizar Firestore para ${id_pago}:`, err);
      }
    } else {
      console.warn("⚠️ id_pago no está presente en metadata.");
    }
  }

  res.status(200).send('Received');
});