import supabaseClient from "../core/supabaseClient.js";
import { renderFlashMessage, setFlashMessage } from "../utils/helpers.js";

const form = document.getElementById("loginForm");

// Show flash message if redirected from another page
renderFlashMessage("auth");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      setFlashMessage("Please enter email and password", "error", "auth");
      location.reload();
      return;
    }

    // Check user in database
    const { data, error } = await supabaseClient
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();

    if (error || !data) {
      console.error("Login error:", error);
      setFlashMessage("Invalid email or password", "error", "auth");
      location.reload();
      return;
    }

    console.log("User logged in:", data);

    // Store session
    localStorage.setItem("user", JSON.stringify(data));
    localStorage.setItem("userId", data.user_id);
    localStorage.setItem("role", data.role);
    localStorage.setItem("name", data.name);

    // Success message
    setFlashMessage("Login successful", "success", "dashboard");

    // Redirect based on role
    if (data.role === "admin") {
      window.location.href = "../dashboards/admin.html";
    } 
    else if (data.role === "owner") {
      window.location.href = "../dashboards/owner.html";
    } 
    else {
      window.location.href = "../dashboards/tenant.html";
    }

  } catch (err) {

    console.error("Unexpected error:", err);
    setFlashMessage("Something went wrong", "error", "auth");
    location.reload();

  }
});