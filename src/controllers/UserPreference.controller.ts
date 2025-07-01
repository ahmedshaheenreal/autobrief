import { Request, Response } from "express";
import { choosePreferences } from "../services/userService";
import { NEWS_TOPICS_SET } from "../CONSANSTS/generalConstant";
//To add the user oref for the first time
export const AddUserPreference = async (req: Request, res: Response) => {
  try {
    // Extract user ID and preferences from the request body
    const userId = parseInt(req.params.userId, 10);
    const { topics, delivery_time, delivery_frequency, delivery_method } =
      req.body;

    // Validate the input data
    if (!topics || !delivery_time || !delivery_frequency || !delivery_method) {
      res.status(400).json({ message: "All fields are required." });
      return;
    }
    if (
      !Array.isArray(topics) ||
      !topics.length ||
      !["daily", "weekly"].includes(delivery_frequency) ||
      !["email", "webhook"].includes(delivery_method)
    ) {
      res.status(400).json({ message: "Invalid input data." });
      return;
    }

    for (const topic of topics) {
      if (NEWS_TOPICS_SET.has(topic) === false) {
        res.status(400).json({ message: "Invalid topic name." });
        return;
      }
    }
    await choosePreferences(topics, req.body.userEmail);

    res.status(201).json({ message: "User preferences added successfully." });
  } catch (error) {
    console.error("Error adding user preferences:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
