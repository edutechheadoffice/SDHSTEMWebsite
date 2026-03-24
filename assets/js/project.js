
const { createClient } = supabase;

const supabaseClient = createClient(
  "https://tiiprawotipmnqdwfdpi.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpaXByYXdvdGlwbW5xZHdmZHBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMTQ0MTgsImV4cCI6MjA4NzU5MDQxOH0.jcZkmEX8JnIh8qMIyEY4mQGj1UNh9xOSsdh0HabzReI"
);

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

async function loadCategoryCounts() {
  const { data, error } = await supabaseClient
    .from("stem_projects")
    .select("category");

  if (error) {
    console.error(error);
    return;
  }

  // hitung jumlah category
  const counts = {};

  data.forEach(item => {
    if (!item.category) return;

    counts[item.category] = (counts[item.category] || 0) + 1;
  });

  // render ke HTML
  const container = document.getElementById("categoryList");
  container.innerHTML = "";

  Object.keys(counts).forEach(cat => {
    container.innerHTML += `
      <li>
        <a href="stem-posts.html?category=${encodeURIComponent(cat)}">
          ${cat} <span>${counts[cat]}</span>
        </a>
      </li>
    `;
  });
}
loadCategoryCounts();

async function loadProject() {
  const { data, error } = await supabaseClient
    .from("stem_projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  // Title browser
  document.title = data.title + " | SDH STEM Gallery";

  // Update header]
  document.getElementById("pageSchoolTitle").innerText =
  `STEM Projects in ${data.school}`;

document.getElementById("pageSchoolSubtitle").innerHTML =
  `Explore how each ${data.school} brings STEM learning to life. <br> Click to see their projects and innovations`;


//Categories count sidebar
function renderCategories(data) {

  const categoryMap = {};

  data.forEach(item => {
    if (!item.category) return;

    if (!categoryMap[item.category]) {
      categoryMap[item.category] = 0;
    }

    categoryMap[item.category]++;
  });

  const container = document.getElementById("categoryList");
  container.innerHTML = "";

  Object.keys(categoryMap).forEach(cat => {
    container.innerHTML += `
      <li>
        <a href="#" onclick="filterCategory('${cat}')">
          ${cat}
          <span>${categoryMap[cat]}</span>
        </a>
      </li>
    `;
  });
}

  // Update konten utama
  document.querySelector(".entry-media img").src = data.image_header;
  document.querySelector(".wpo-blog-content h2").innerText = data.title;
document.getElementById("projectDescription").innerHTML = data.description;

  // Update meta
  document.querySelector(".entry-meta ul").innerHTML = `
    <li><i class="fi flaticon-user"></i> By <a href="#">${data.author}</a></li>
    <li><i class="fa fa-graduation-cap"></i>${data.school_grade}</li>
    <li><i class="fas fa-atom"></i>${data.category}</li>
    <li><i class="fa-solid fa-location-dot"></i>${data.school}</li>
  `;

//update profile
document.querySelector(".about-widget .img-holder img").src = data.author_image;
document.querySelector(".about-widget h4").innerText = data.author;

const pageUrl = window.location.href;
const pageTitle = encodeURIComponent(data.title);
const pageImage = encodeURIComponent(data.image_header);

// Facebook
document.getElementById("shareFacebook").href =
  `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;

// Twitter (X)
document.getElementById("shareTwitter").href =
  `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`;

// LinkedIn
document.getElementById("shareLinkedin").href =
  `https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`;

// Pinterest
document.getElementById("sharePinterest").href =
  `https://pinterest.com/pin/create/button/?url=${pageUrl}&media=${pageImage}&description=${pageTitle}`;


  // Render tags
const tagContainer = document.querySelector(".tag-share .tag ul");
tagContainer.innerHTML = "";

if (data.tags && Array.isArray(data.tags)) {
  data.tags.forEach(tag => {
    const li = document.createElement("li");
    const a = document.createElement("a");

    a.href = "#";
    a.textContent = tag; // lebih aman daripada innerHTML

    li.appendChild(a);
    tagContainer.appendChild(li);
  });
}
}

async function loadrelatedpost() {
  const { data, error } = await supabaseClient
    .from("stem_projects")
    .select("*")
    .order("id", { ascending: false })
    .limit(3);

  if (error) {
    console.error(error);
    return;
  }

  const container = document.getElementById("relatedpost");

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
    container.innerHTML += `<div class="post">
                                        <div class="img-holder">
                                            <img src="${item.image_header ||'assets/images/80x80.png'}" alt>
                                        </div>
                                        <div class="details">
                                            <h4><a href="project.html?id=${item.id}">${item.title}</a>
                                            </h4>
                                            <span class="date">${item.school}</span>
                                        </div>
     `;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadrelatedpost();
});

async function loadPrevNext(currentId) {

  //  PREVIOUS (id lebih kecil, paling dekat)
  const { data: prev } = await supabaseClient
    .from("stem_projects")
    .select("id, title")
    .lt("id", currentId)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  //  NEXT (id lebih besar, paling dekat)
  const { data: next } = await supabaseClient
    .from("stem_projects")
    .select("id, title")
    .gt("id", currentId)
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  renderPrevNext(prev, next);
}
function renderPrevNext(prev, next) {

  const prevContainer = document.querySelector(".previous-post");
  const nextContainer = document.querySelector(".next-post");

  // previous post
  if (prev) {
    prevContainer.innerHTML = `
      <a href="project.html?id=${prev.id}">
        <span class="post-control-link">Previous Post</span>
        <span class="post-name">${prev.title}</span>
      </a>
    `;
  } else {
    prevContainer.innerHTML = `
      <span class="text-muted">No previous post</span>
    `;
  }

  // next post
  if (next) {
    nextContainer.innerHTML = `
      <a href="project.html?id=${next.id}">
        <span class="post-control-link">Next Post</span>
        <span class="post-name">${next.title}</span>
      </a>
    `;
  } else {
    nextContainer.innerHTML = `
      <span class="text-muted">No next post</span>
    `;
  }
}


loadProject();
loadPrevNext(id);