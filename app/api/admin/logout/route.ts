export async function GET(request: Request) {
  return new Response(null, { status: 302, headers: { location: new URL("/portal/login", request.url).toString(), "set-cookie": "portal_admin=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0" } });
}
