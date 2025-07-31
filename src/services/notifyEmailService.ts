import { configDotenv } from "dotenv";
import nodemailer from "nodemailer";
import { User } from "../models/User.model";
import AppDataSource from "../db/dbconfig";
import { Article } from "../models/Article.model";
import { SEPARATOR } from "../CONSANSTS/generalConstant";
import { Between, In } from "typeorm";
import { Digest } from "../models/Digests.model";

configDotenv(); // Load .env variables
export const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  auth: {
    user: "shahhhen10@gmail.com", // your Gmail address
    pass: "esxa huix dfyv nvga", // your Gmail app password
  },
});
const digestMap = {};
export const sendEmail = async (to: string, subject: string, html: string) => {
  const info = await transporter.sendMail({
    from: `"AutoBrief" <shahhhen10@gmail.com>`, // sender address
    to,
    subject,
    html,
  });

  console.log("Message sent: %s", info.messageId);
};
const createDigest = async (digestString: string): Promise<string> => {
  let digestTopics = digestString.split(SEPARATOR);
  // fetch the corrospending articles from the database
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());
  const articleRepo = AppDataSource.getRepository(Article);
  const articles = await articleRepo.find({
    where: {
      title: In(digestTopics),
      createdAt: Between(todayStart, todayEnd),
    },
  });
  let digest = "";
  // Get today's start and end
  for (const article of articles) {
    const formattedSummary = `
                            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                              <h2>🗂️ Category: <span style="color:#0056b3;">${article.topic.name}</span></h2>
                              <h3>📰 ${article.title}</h3>
                              <p><strong>📝 Summary:</strong><br>${article.summary}</p>
                              <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
                            </div>
                              `;
    digest = digest + formattedSummary;
  }

  const digestRepo = AppDataSource.getRepository(Digest);
  const digestInstance = digestRepo.create({
    articles,
    digest_content: digest,
    digestString,
  });
  await digestRepo.save(digestInstance);
  return digest;
};

export const sendDailyDigest = async (article: Article) => {
  const userRepo = AppDataSource.getRepository(User);
  const users = await userRepo.find({});
  const currentDate = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format
  let digest: string = "";
  for (const user of users) {
    const digestString = user.details.topic_String;

    if (!digestMap[digestString] === undefined) {
      //form a digest if it does not exist
      digest = await createDigest(digestString);
      digestMap[digestString] = digest;
    }

    //save update digest users list
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    const digestRepo = AppDataSource.getRepository(Digest);
    const digestInstance = await digestRepo.findOne({
      where: { digestString, created_at: Between(todayStart, todayEnd) },
    });
    digestInstance.users.push(user);
    await digestRepo.save(digestInstance);

    sendEmail(
      user.email,
      "Your News Daily Digest!",
      digestInstance.digest_content
    );
  }
};
function startOfDay(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

function endOfDay(date: Date): Date {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}
/*


  -The server summerizes news articles from various categories and saves them to the database.
  -The server loops through each one of the users and sends them their daily digest.
  -The server also saves the digest in the database

 */
