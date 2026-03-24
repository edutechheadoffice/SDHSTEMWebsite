const { createClient } = supabase;

const supabaseClient = createClient(
  "https://tiiprawotipmnqdwfdpi.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpaXByYXdvdGlwbW5xZHdmZHBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMTQ0MTgsImV4cCI6MjA4NzU5MDQxOH0.jcZkmEX8JnIh8qMIyEY4mQGj1UNh9xOSsdh0HabzReI"
);

async function loadLatestProjects() {
  const { data, error } = await supabaseClient
    .from("stem_projects")
    .select("*")
    .order("id", { ascending: false })
    .limit(3);

  if (error) {
    console.error(error);
    return;
  }

  const container = document.getElementById("latestProjects");

  if (!container) {
    console.error("Container #latestProjects not found");
    return;
  }

  container.innerHTML = "";

  if (!data || data.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5">
        <h5>No projects yet</h5>
      </div>
    `;
    return;
  }

  data.forEach(item => {
    container.innerHTML += `
      <div class="col col-lg-4 col-md-6 col-12">
        <div class="wpo-blog-item">
          <div class="wpo-blog-img">
            <img src="${item.image_header || 'assets/images/blog/img-1.jpg'}" alt="">
          </div>
          <div class="wpo-blog-content">
            <ul>
              <li>${item.school}</li>
              <li>By <a href="#">${item.author || "Unknown"}</a></li>
            </ul>
            <h2>
              <a href="project.html?id=${item.id}">
                ${item.title || "Untitled"}
              </a>
            </h2>
            <a href="project.html?id=${item.id}" class="more">Read More</a>
          </div>
        </div>
      </div>
    `;
  });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadLatestProjects();
});