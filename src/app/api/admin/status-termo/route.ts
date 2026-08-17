import { NextResponse } from "next/server";

function isAdminAuthed(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.includes("kiri_admin=ok");
}

export async function GET(request: Request) {
  if (!isAdminAuthed(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const autentiqueToken = process.env.AUTENTIQUE_API_TOKEN;
  if (!autentiqueToken) {
    return NextResponse.json({ error: "Token Autentique não configurado" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get("document_id");
  if (!documentId) {
    return NextResponse.json({ error: "document_id obrigatório" }, { status: 400 });
  }

  const query = `
    query GetDocument($id: UUID!) {
      document(id: $id) {
        id
        name
        created_at
        signers {
          name
          email
          signed_at
          action { name }
        }
      }
    }
  `;

  const res = await fetch("https://api.autentique.com.br/v2/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${autentiqueToken}`,
    },
    body: JSON.stringify({ query, variables: { id: documentId } }),
  });

  const result = await res.json();
  if (result.errors) {
    return NextResponse.json({ error: result.errors[0]?.message ?? "Erro Autentique" }, { status: 500 });
  }

  const doc = result.data?.document;
  if (!doc) return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 });

  const signer = doc.signers?.[0];
  return NextResponse.json({
    document_id: doc.id,
    name: doc.name,
    created_at: doc.created_at,
    signer_email: signer?.email ?? null,
    signed: !!signer?.signed_at,
    signed_at: signer?.signed_at ?? null,
  });
}
