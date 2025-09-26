// apps/functions/newsletter.ts
import { fetchArticles } from "@/lib/news";
import { inngest } from "@/lib/inngest/client";
import OpenAI from "openai";
import { marked } from "marked";
import sendEmail from "@/lib/email";
import { createClient } from "@/lib/supabase/server";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY!,
  // optional headers for rankings:
  // defaultHeaders: {
  //   "HTTP-Referer": "https://your-site.example",
  //   "X-Title": "Your Site Title",
  // },
});

export default inngest.createFunction(
  { id: "newsletter/scheduled" },
  { event: "newsletter.schedule" },
  async ({ event, step, runId }) => {
    const isUserActive = await step.run("check-user-status", async () => {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("user_preferences")
        .select("is_active")
        .eq("user_id", event.data.userId)
        .single();

      if (error) {
        console.error("Error checking user status:", error);
        return false;
      }

      return data?.is_active || false;
    });

    // If user has paused their newsletter, exit early
    if (!isUserActive) {
      console.log(
        `User ${event.data.userId} has paused their newsletter. Skipping processing.`
      );
      return {
        skipped: true,
        reason: "User newsletter is paused",
        userId: event.data.userId,
        runId: runId,
      };
    }
    const categories = event.data.categories ?? [
      "technology",
      "business",
      "politics",
    ];

    // fetch articles
    const allArticles = await step.run("Fetch news", async () => {
      return fetchArticles(categories);
    });

    // format into newsletter messages
    const messages: any = [
      {
        role: "system",
        content: `You are an expert newsletter editor creating a personalized newsletter.
                  Write a concise, engaging summary that:
                  - Highlights the most important stories
                  - Provides context and insights
                  - Uses a friendly, conversational tone
                  - Is well-structured with clear sections
                  - Keeps the reader informed and engaged
                  Format the response as a proper newsletter with a title and organized content.
                  Make it email-friendly with clear sections and engaging subject lines.`,
      },
      {
        role: "user",
        content: `Create a newsletter summary for these articles from the past week.
            Categories requested: ${categories.join(", ")}

        Articles:
        ${allArticles
          .map(
            (a: any, i: number) =>
              `${i + 1}. ${a.title}\n${a.description ?? ""}\nsource: ${a.url}\n`
          )
          .join("\n")}`,
      },
    ];

    // call OpenAI via OpenRouter
    const completion = await step.run("AI summarization", async () => {
      return openai.chat.completions.create({
        model: "openai/gpt-4o",
        messages,
        max_tokens: 1000,
      });
    });

    const summary =
      completion.choices[0]?.message?.content ?? "No summary generated";

    if (!summary) {
      throw new Error("Failed to generate newsletter content");
    }

    const htmlResult = await marked(summary);

    await step.run("send-email", async () => {
      await sendEmail(
        event?.data?.email,
        event?.data?.categories.join(", "),
        allArticles.length,
        htmlResult
      );
    });

    await step.run("schedule-next", async () => {
      const now = new Date();
      let nextScheduleTime: Date;

      switch (event.data.frequency) {
        case "daily":
          nextScheduleTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          break;
        case "weekly":
          nextScheduleTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case "biweekly":
          nextScheduleTime = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
          break;
        default:
          nextScheduleTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      }
      nextScheduleTime.setHours(9, 0, 0, 0);

      await inngest.send({
        name: "newsletter.schedule",
        data: {
          userId: event.data.userId,
          email: event.data.email,
          categories: event.data.categories,
          frequency: event.data.frequency,
          scheduledFor: nextScheduleTime.toISOString(),
        },
        ts: nextScheduleTime.getTime(),
      });
    });
    const result = {
      newsletter: summary,
      articleCount: allArticles.length,
      categories: event.data.categories,
      emailSent: true,
      nextScheduled: true,
      success: true,
      runId: runId,
    };
    return result;
  }
);
