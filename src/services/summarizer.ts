import { config } from "../config/env";

const SUMMARIZER_URL =
  "https://api-inference.huggingface.co/models/facebook/bart-large-cnn";

/** Summarizes text using the Hugging Face BART summarization model. */
export async function summarizeText(text: string): Promise<string> {
  const response = await fetch(SUMMARIZER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.huggingFaceToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: text }),
  });
  if (!response.ok) {
    throw new Error(`Summarization request failed with status ${response.status}`);
  }

  const result = await response.json();
  const summary = Array.isArray(result) ? result[0]?.summary_text : undefined;
  if (typeof summary !== "string") {
    throw new Error("Unexpected response from summarization API");
  }
  return summary.trim();
}
