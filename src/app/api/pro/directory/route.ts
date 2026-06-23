import { NextResponse } from "next/server";
import data from "@/data/profissionais.json";
import type { Profissional } from "@/types";

function isProAuthed(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.includes("kiri_pro=ok");
}

export async function GET(request: Request) {
  if (!isProAuthed(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const profissionais = (data.profissionais as Profissional[]).filter((p) => p.verificado);
  return NextResponse.json(profissionais);
}
