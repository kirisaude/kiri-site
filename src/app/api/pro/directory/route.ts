import { NextResponse } from "next/server";
import { createHash } from "crypto";
import data from "@/data/profissionais.json";
import type { Profissional } from "@/types";

function isProAuthed(request: Request) {
  const senhaCorreta = process.env.KIRI_PRO_SENHA;
  if (!senhaCorreta) return false;
  const hash = createHash("sha256").update(senhaCorreta).digest("hex");
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.includes(`kiri_pro=${hash}`);
}

export async function GET(request: Request) {
  if (!isProAuthed(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const profissionais = (data.profissionais as Profissional[]).filter((p) => p.verificado);
  return NextResponse.json(profissionais);
}
