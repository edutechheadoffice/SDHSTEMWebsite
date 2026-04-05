document.addEventListener("DOMContentLoaded", async function () {

  if (typeof supabase === "undefined") return;

  const { createClient } = supabase;

  const supabaseClient = createClient(
    "https://tiiprawotipmnqdwfdpi.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpaXByYXdvdGlwbW5xZHdmZHBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMTQ0MTgsImV4cCI6MjA4NzU5MDQxOH0.jcZkmEX8JnIh8qMIyEY4mQGj1UNh9xOSsdh0HabzReI"
  );

  const { data: { session } } = await supabaseClient.auth.getSession();

  const adminAreas = document.querySelectorAll("#adminArea");
  if (adminAreas.length === 0) return;

  adminAreas.forEach(adminArea => {

    if (session) {

      adminArea.innerHTML = `
        <a href="#" id="openPostModal" class="theme-btn" style="margin-right:10px;">
          <span class="text">+ Post</span>
        </a>
        <a href="#" class="theme-btn logoutBtn" style="background:#d9534f;">
          <span class="text">Sign Out</span>
        </a>
      `;

    } else {

      adminArea.innerHTML = `
        <a href="login.html" class="theme-btn">
          <span class="text">Sign in</span>
        </a>
      `;

    }

  });

  //Logout handler (delegated)
  document.addEventListener("click", async function(e){

    if (e.target.closest(".logoutBtn")) {
      e.preventDefault();
      await supabaseClient.auth.signOut();
      window.location.reload();
    }

    if (e.target.closest("#openPostModal")) {
      e.preventDefault();

      const modalElement = document.getElementById('createPostModal');
      if (!modalElement) return;

      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }

  });
//Word Counter Module
function Counter(quill, options) {
  const container = document.querySelector('#counter');

  quill.on('text-change', function () {
    const text = quill.getText().trim();

    if (!text) {
      container.innerText = "0 words";
      return;
    }

    const words = text.split(/\s+/).filter(word => word.length > 0);
    container.innerText = words.length + " words";
  });
}


Quill.register('modules/counter', Counter);

// ===== Init Quill =====
window.quill = new Quill('#editor', {
  theme: 'snow',
  placeholder: 'Write your STEM project posts...(Description, Project Process, Result & Conclusion)',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'blockquote'],
      [{ 'header': [1, 2, 3, false] }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['image', 'video'],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'direction': 'rtl' }]
    ],
    counter: true
  }
});

//grade filter
document.addEventListener("change", function(e){

  if (e.target.id !== "postSchoolLevel") return;

  const gradeSelect = document.getElementById("postSchoolGrade");
  const level = e.target.value;

  gradeSelect.innerHTML = '<option value="">Select School Grade</option>';

  if (level === "Junior School") {
    //kindy
    gradeSelect.innerHTML += `<option value="K-1">K-1</option>`;
    gradeSelect.innerHTML += `<option value="K-2">K-2</option>`;
    gradeSelect.innerHTML += `<option value="K-3">K-3</option>`;
    for (let i = 1; i <= 6; i++) {
      gradeSelect.innerHTML += `<option value="Grade ${i}">Grade ${i}</option>`;
    }
  }

  if (level === "Senior School") {
    for (let i = 7; i <= 12; i++) {
      gradeSelect.innerHTML += `<option value="Grade ${i}">Grade ${i}</option>`;
    }
  }

});


});