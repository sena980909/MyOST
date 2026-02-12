import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAdminClient } from "@/lib/supabase";

const BADWORDS = [
  // Korean
  "시발", "씨발", "ㅅㅂ", "ㅆㅂ", "병신", "ㅂㅅ", "지랄", "ㅈㄹ",
  "개새끼", "새끼", "ㅅㄲ", "미친", "좆", "ㅈ같", "꺼져", "닥쳐",
  "썅", "엿먹어", "죽어", "ㄲㅈ", "년", "놈", "씹", "개같",
  "걸레", "창녀", "한남", "한녀", "느금마", "니미", "애미",
  // English
  "fuck", "shit", "ass", "bitch", "dick", "pussy", "nigger", "nigga",
  "cunt", "whore", "slut", "bastard", "damn", "cock", "penis",
  // Admin impersonation
  "admin", "관리자", "운영자", "myost", "시스템",
];

function containsBadWord(name: string): boolean {
  const lower = name.toLowerCase().replace(/\s/g, "");
  return BADWORDS.some((word) => lower.includes(word));
}

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "이메일, 비밀번호, 닉네임을 모두 입력해주세요." },
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

    const trimmedName = name.trim();

    if (trimmedName.length === 0) {
      return NextResponse.json(
        { error: "닉네임을 입력해주세요." },
        { status: 400 }
      );
    }

    if (trimmedName.length < 2 || trimmedName.length > 20) {
      return NextResponse.json(
        { error: "닉네임은 2~20자여야 합니다." },
        { status: 400 }
      );
    }

    if (containsBadWord(trimmedName)) {
      return NextResponse.json(
        { error: "사용할 수 없는 닉네임입니다." },
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
        { error: "이미 가입된 이메일입니다." },
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
        { error: "이미 사용 중인 닉네임입니다." },
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
