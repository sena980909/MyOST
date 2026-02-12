import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAdminClient } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "이메일, 비밀번호, 이름을 모두 입력해주세요." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "올바른 이메일 형식이 아닙니다." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "비밀번호는 6자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    if (name.trim().length === 0) {
      return NextResponse.json(
        { error: "이름을 입력해주세요." },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    // Check duplicate email for credentials provider
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .eq("provider", "credentials")
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "이미 가입된 이메일입니다." },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const { error } = await supabase.from("users").insert({
      email,
      name: name.trim(),
      provider: "credentials",
      provider_account_id: email,
      password_hash: passwordHash,
    });

    if (error) {
      console.error("Signup insert error:", error);
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "이미 가입된 이메일입니다." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "회원가입 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
