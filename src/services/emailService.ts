import nodemailer, { Transporter } from "nodemailer";
import { config } from "../config/env";

let transporter: Transporter | undefined;

// Created lazily so importing this module never opens a connection.
const getTransporter = (): Transporter => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: config.mail.user, pass: config.mail.pass },
    });
  }
  return transporter;
};

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<string> => {
  const info = await getTransporter().sendMail({
    from: `"AutoBrief" <${config.mail.user}>`,
    to,
    subject,
    html,
  });
  return info.messageId;
};
