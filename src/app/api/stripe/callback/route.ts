import { stripe } from "@/lib/stripe";
import { updateSubAccountConnectedId } from "@/lib/queries";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // format: launchpad___<id>

  if (!code || !state) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const [, id] = state.split("___");

  try {
    const response = await stripe.oauth.token({
      grant_type: "authorization_code",
      code,
    });

    if (response?.stripe_user_id) {
      await updateSubAccountConnectedId(id, response.stripe_user_id);
    }
  } catch (error) {
    console.error("[Stripe OAuth Callback Error]", error);
  }

  // Redirect back to the launchpad
  return NextResponse.redirect(
    new URL(`/subaccount/${id}/launchpad`, req.url)
  );
}
