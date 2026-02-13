import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAdminClient } from "@/lib/supabase";
import { containsBadWord } from "@/lib/badwords";
import { Lang, getTranslations } from "@/lib/i18n";

export async function POST(request: Request) {
  try {
    const { email, password, name, lang = "ko" } = await request.json() as {
      email: string;
      password: string;
      name: string;
      lang?: Lang;
    };
    const t = getTranslations(lang === "en" ? "en" : "ko");

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: t.signup.allRequired },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: t.signup.invalidEmail },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: t.signup.shortPassword },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    if (trimmedName.length === 0) {
      return NextResponse.json(
        { error: t.signup.nameRequired },
        { status: 400 }
      );
    }

    if (trimmedName.length < 2 || trimmedName.length > 20) {
      return NextResponse.json(
        { error: t.signup.nameLength },
        { status: 400 }
      );
    }

    if (containsBadWord(trimmedName)) {
      return NextResponse.json(
        { error: t.signup.nameBadWord },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    // Check duplicate email
    const { data: existingEmail } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .eq("provider", "credentials")
      .single();

    if (existingEmail) {
      return NextResponse.json(
        { error: t.signup.emailExists },
        { status: 409 }
      );
    }

    // Check duplicate nickname
    const { data: existingName } = await supabase
      .from("users")
      .select("id")
      .eq("name", trimmedName)
      .single();

    if (existingName) {
      return NextResponse.json(
        { error: t.signup.nameExists },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const { error } = await supabase.from("users").insert({
      email,
      name: trimmedName,
      provider: "credentials",
      provider_account_id: email,
      password_hash: passwordHash,
    });

    if (error) {
      console.error("Signup insert error:", error);
      if (error.code === "23505") {
        return NextResponse.json(
          { error: t.signup.emailExists },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: t.signup.signupError },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: "A server error occurred." },
      { status: 500 }
    );
  }
}
