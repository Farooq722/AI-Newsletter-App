import { inngest } from "@/lib/inngest/client";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        error: "You must be logged in to save preferences.",
      },
      {
        status: 401,
      }
    );
  }

  const body = await request.json();
  const { categories, frequency, email } = body;

  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return NextResponse.json(
      { error: "Categories array is required and must not be empty" },
      { status: 400 }
    );
  }

  if (!frequency || !["daily", "weekly", "biweekly"].includes(frequency)) {
    return NextResponse.json(
      { error: "Valid frequency is required (daily, weekly, biweekly)" },
      { status: 400 }
    );
  }

  const { error: upsertError } = await supabase.from("user_preferences").upsert(
    {
      user_id: user.id,
      categories,
      frequency,
      email,
      is_active: true,
    },
    { onConflict: "user_id" }
  );

  if (upsertError) {
    console.error("Error while saving preferences", upsertError);
    return NextResponse.json(
      { error: "Failed to save preferences" },
      {
        status: 500,
      }
    );
  }

  await inngest.send({
    name: "newsletter.schedule",
    data: {},
  });

  return NextResponse.json(
    {
      success: true,
      msg: "Preferences save to table",
    },
    {
      status: 200,
    }
  );
}
