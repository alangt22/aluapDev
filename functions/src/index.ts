import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { Resend } from "resend";

admin.initializeApp();
const db = admin.firestore();

const resend = new Resend("re_axcvVLAi_5jh6StwNcuARwwQ7L8cHFiaz");

export const enviarEmailsDeVencimento = functions.pubsub
  .schedule("05 2 * * *")
  .timeZone("America/Sao_Paulo")
  .onRun(async () => {
    const hoje = new Date();
    const amanha = new Date();
    amanha.setDate(hoje.getDate() + 1);

    const snapshot = await db
      .collection("listas")
      .where("vencimento", ">=", new Date(amanha.setHours(0, 0, 0)))
      .where("vencimento", "<", new Date(amanha.setHours(23, 59, 59)))
      .get();

    if (snapshot.empty) {
      console.log("Nenhuma lista com vencimento amanhã.");
      return null;
    }

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const userId = data.userId;
      const vencimento = data.vencimento.toDate();
      const nomeLista = data.nome;

      const userRef = await db.collection("users").doc(userId).get();
      const userEmail = userRef.data()?.email;

      if (!userEmail) {
        console.warn(`Usuário ${userId} não tem e-mail`);
        continue;
      }

      await resend.emails.send({
        from: "Alan Dev <onboarding@resend.dev>",
        to: userEmail,
        subject: `Lembrete: lista "${nomeLista}" vence em breve`,
        html: `
          <h2>Olá!</h2>
          <p>A lista <strong>${nomeLista}</strong> vence em: ${vencimento.toLocaleDateString("pt-BR")}.</p>
          <p>Não se esqueça de conferir!</p>
        `,
      });
    }

    return null;
  });
