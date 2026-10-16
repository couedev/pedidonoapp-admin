import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/loginadmin";

    return NextResponse.redirect(loginUrl);
  }

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();

  const isAdmin = data?.claims.app_metadata?.role === "admin";

  if (!data?.claims.sub || !isAdmin) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/loginadmin";
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    loginUrl.searchParams.set("error", "unauthorized");

    const redirectResponse = NextResponse.redirect(loginUrl);
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));

    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
