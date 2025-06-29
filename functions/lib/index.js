"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.enviarEmailsDeVencimento = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
const resend_1 = require("resend");
admin.initializeApp();
const db = admin.firestore();
// Substitua com sua API Key
const resend = new resend_1.Resend("re_axcvVLAi_5jh6StwNcuARwwQ7L8cHFiaz");
// Executa todos os dias às 7h da manhã
exports.enviarEmailsDeVencimento = functions.pubsub
    .schedule("05 2 * * *")
    .timeZone("America/Sao_Paulo")
    .onRun(async () => {
    const hoje = new Date();
    const amanha = new Date();
    amanha.setDate(hoje.getDate() + 1);
    // Consulta listas com vencimento amanhã
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
/*

import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { Resend } from "resend";

admin.initializeApp();
const db = admin.firestore();

// ⚠️ Recomendado: mova essa chave para variáveis de ambiente no futuro
const resend = new Resend("re_axcvVLAi_5jh6StwNcuARwwQ7L8cHFiaz");

// ✅ Função HTTP para testar envio de e-mail manualmente
export const testarEnvioEmail = functions
  .region("us-central1") // ou sua região preferida
  .https.onRequest(async (req, res) => {
    const testEmail = req.query.email as string;
    const testNome = (req.query.nome as string) ?? "Lista de Teste";
    const testVencimento = new Date();

    // 🧪 Validação básica
    if (!testEmail || !testEmail.includes("@")) {
      res.status(400).send("Parâmetro 'email' é obrigatório e precisa ser válido.");
      return;
    }

    try {
      const result = await resend.emails.send({
        from: "Alan Dev <onboarding@resend.dev>", // 👈 de preferência um domínio verificado na Resend
        to: testEmail,
        subject: `Teste de vencimento da lista "${testNome}"`,
        html: `
          <h2>Olá!</h2>
          <p>Este é um teste de envio de e-mail para a lista <strong>${testNome}</strong>.</p>
          <p>Data de vencimento: ${testVencimento.toLocaleDateString("pt-BR")}.</p>
        `,
      });

      console.log("Resultado do envio:", result);
      res.status(200).send("✅ E-mail de teste enviado com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao enviar e-mail:", error);
      res.status(500).send("Erro ao enviar e-mail.");
    }
  });
 */
