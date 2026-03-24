//login
$(document).ready(function () {

  if ($("#loginForm").length === 0) {
    return; // kalau bukan halaman login, stop di sini
  }

  const { createClient } = supabase

   const supabaseClient = createClient(
    "https://tiiprawotipmnqdwfdpi.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpaXByYXdvdGlwbW5xZHdmZHBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMTQ0MTgsImV4cCI6MjA4NzU5MDQxOH0.jcZkmEX8JnIh8qMIyEY4mQGj1UNh9xOSsdh0HabzReI"
  )


  $("#loginForm").on("submit", async function(e){

    e.preventDefault()

    console.log("SUBMIT TRIGGERED")

    const username = $("#username").val().trim()
    const password = $("#password").val().trim()
    function formatName(username){
  return username
    .split(".")
    .map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ")
}

    if(!username || !password){
      showToast("Please fill your username and password.\nFor further information, contact Edutech.", "warning")
      return
    }

    const fakeEmail = username + "@sdh.or.id"

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: fakeEmail,
      password: password
    })

    if(error){
      showToast("Login failed. Check your credentials and try again.", "danger");
    } else {
  showToast("Welcome, " + formatName(username) + "! Redirecting you to Admin preview...", "success");

  setTimeout(() => {
    window.location.href = "stem-posts.html";
  }, 1200);
}
  })

})

document.querySelector(".toggle-password").addEventListener("click", function () {
    const passwordInput = document.getElementById("password");
    const icon = this.querySelector("i");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        passwordInput.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
});