import supabaseClient from "../core/supabaseClient.js";
import { setFlashMessage, showToast } from "../utils/helpers.js";

const form = document.getElementById("registerForm");
const REGISTRATION_ROLES = ["owner", "tenant"];

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const fullName = document.getElementById("name").value.trim();
    const email    = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const role     = document.getElementById("role").value;

    if (!fullName || !email || !password || !role) {
      showToast("Please fill all required fields", "error");
      return;
    }

    if (!REGISTRATION_ROLES.includes(role)) {
      showToast("Only owner and tenant accounts can be self-registered", "error");
      return;
    }

    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Registering…";

    try {
      // ── Step 1: Create Supabase Auth user ──────────────────────────
      const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({
        email,
        password
      });

      if (signUpError) {
        const msg = signUpError.message?.toLowerCase() || "";
        if (msg.includes("already registered") || msg.includes("already been registered")) {
          throw new Error("An account with this email already exists. Please log in instead.");
        }
        throw new Error(signUpError.message || "Registration failed");
      }

      const authUserId = signUpData?.user?.id;
      if (!authUserId) {
        throw new Error("Unable to create account. Please try again.");
      }

      // ── Step 2: Sign in immediately to activate the auth session ───
      // The RLS policy on public.users requires auth.uid() to match auth_user_id,
      // so we must have an active session before inserting.
      const { error: signInError } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        // Email confirmation might be required — can't complete insert without session.
        throw new Error("Account created but sign-in failed: " + signInError.message +
          " — Please check if email confirmation is required in Supabase settings.");
      }

      // ── Step 3: Insert into public.users (RLS: auth.uid() = auth_user_id) ──
      // Note: 'password' column is kept to satisfy any NOT NULL constraint.
      // To remove it: ALTER TABLE public.users ALTER COLUMN password DROP NOT NULL;
      const { error: profileError } = await supabaseClient.from("users").insert({
        name:         fullName,
        email,
        role,
        auth_user_id: authUserId,
        password      // keep if column has NOT NULL; safe to remove after making it nullable
      });

      if (profileError) {
        // Roll back: sign out and delete auth user if possible
        await supabaseClient.auth.signOut();
        console.error("users insert error:", profileError);
        throw new Error(
          profileError.code === "42501"
            ? "Permission denied — Run the RLS policy SQL in Supabase SQL Editor."
            : profileError.message || "Profile setup failed"
        );
      }

      // ── Step 4: Sign out — user must log in fresh ──────────────────
      // The DB trigger will have auto-created the owners/tenants row.
      await supabaseClient.auth.signOut();

      setFlashMessage("Account created! Please log in.", "success", "auth");
      window.location.href = "/pages/login.html";

    } catch (error) {
      showToast(error.message || "Registration failed", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Register";
    }
  });
}
