import { fetchArticles } from "@/lib/news";
import { inngest } from "@/lib/inngest/client";

export default inngest.createFunction(
  { id: "newsletter/scheduled" },
  { event: "newsletter.schedule" },
  async ({ event, step, runId }) => {
    const categories = ["technology", "business", "politics"];
    const allArticles = await step.run("Fetch-news", async () => {
      return fetchArticles(categories);
    });

    //generate the AI summary
    const summary = await step.ai.infer("summarize-news", {
      model: step.ai.models.openai({ model: "gpt-4o" }),
      body: {
        messages: [
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
              Categories requested: ${event.data.categories.join(",")}

              Articles: 
              ${allArticles
                .map(
                  (article: any, idx: number) =>
                    `${idx + 1}. ${article.title}\n  ${
                      article.description
                    }\n  source: ${article.url}\n`
                )
                .join("\n")}
              `,
          },
        ],
      },
    });

    console.log(summary.choices[0].message.content);
    return {};
  }
);
