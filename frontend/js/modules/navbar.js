const name = localStorage.getItem("name");
const welcome = document.getElementById("welcomeUser");

if (name && welcome) {
  welcome.textContent = `Welcome, ${name}`;
}