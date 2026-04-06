
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

  // Update header
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

// Researchposter
document.getElementById("PDFLink").href = data.research_pdf;
// WatchVideo
document.getElementById("YTVideo").href = data.youtube_link;
//Moodle
document.getElementById("MoodleCourse").href = data.moodle_link;

//simpan data dari render
function renderGallery(images) {
  if (!images || images.length === 0) return;

  if (typeof images === "string") {
    images = JSON.parse(images);
  }

  galleryImages = images; //

  const section = document.getElementById("gallerySection");
  const container = document.getElementById("carouselInner");

  section.classList.remove("d-none");

  container.innerHTML = images.map((img, i) => `
    <div class="carousel-item ${i === 0 ? "active" : ""}">
      <div class="ratio-16x9">
        <img src="${img}" class="w-100 h-100"
             style="object-fit:cover; cursor:pointer"
             onclick="openLightbox(${i})">
      </div>
    </div>
  `).join("");
}
renderGallery(data.gallery_images);




// EnrolmentKey
document.getElementById("EnrolmentKey").innerHTML = `<strong> Moodle Key:</strong> ${data.moodle_key}`;

// Facebooklink
document.getElementById("shareFacebook").href =
  `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;

// Twitterlink
document.getElementById("shareTwitter").href =
  `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`;

// LinkedIn
document.getElementById("shareLinkedin").href =
  `https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`;

// Pinterestlink
document.getElementById("sharePinterest").href =
  `https://pinterest.com/pin/create/button/?url=${pageUrl}&media=${pageImage}&description=${pageTitle}`;


  // Render tags

  const tagContainer = document.querySelector(".tag-share .tag ul");

  if (!tagContainer) {
    console.error("Tag container not found");
    return;
  }

  let tags = data.tags;

  if (typeof tags === "string") {
    try {
      tags = JSON.parse(tags);
    } catch (e) {
      console.error("Invalid JSON tags");
      return;
    }
  }

  if (Array.isArray(tags)) {
    tagContainer.innerHTML = "";

    tags.forEach(tag => {
      const li = document.createElement("li");
      const a = document.createElement("a");

      a.href = "#";
      a.textContent = tag;

      li.appendChild(a);
      tagContainer.appendChild(li);
    });
  };
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

  //prevpost
  const { data: prev } = await supabaseClient
    .from("stem_projects")
    .select("id, title")
    .lt("id", currentId)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  //nextpost
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
//tags
async function getTags() {
  const { data, error } = await supabaseClient
    .from("stem_projects")
    .select("tags");

  if (error) {
    console.error("Supabase error:", error);
    return [];
  }

  return data;
}

function extractUniqueTags(rows) {
  let allTags = [];

  rows.forEach(row => {
    let tags = row.tags;

    if (!tags) return;

    if (typeof tags === "string" && tags.startsWith("[")) {
      try {
        tags = JSON.parse(tags);
      } catch {
        return;
      }
    }

    if (typeof tags === "string") {
      tags = tags.split(",").map(t => t.trim());
    }

    if (Array.isArray(tags)) {
      allTags = allTags.concat(tags);
    }
  });

  return [...new Set(allTags)];
}

async function renderTags() {
  const rows = await getTags();
  const tags = extractUniqueTags(rows);

  const container = document.querySelector("#tag-list");

  if (!container) {
    console.error("Tag container not found");
    return;
  }

  container.innerHTML = "";

  tags.forEach(tag => {
    const li = document.createElement("li");
    const a = document.createElement("a");

    a.href = "#";
    a.textContent = tag;

    li.appendChild(a);
    container.appendChild(li);
  });
}

document.addEventListener("DOMContentLoaded", renderTags);

const input = document.getElementById("search-input");
const results = document.getElementById("search-results");

let debounceTimer;

// input listener
input.addEventListener("input", function () {
  clearTimeout(debounceTimer);

  const keyword = this.value.trim();

  debounceTimer = setTimeout(() => {
    searchPosts(keyword);
  }, 300);
});

// query ke Supabase
async function searchPosts(keyword) {
  if (!keyword) {
    results.style.display = "none";
    return;
  }

  const { data, error } = await supabaseClient
    .from("stem_projects")
    .select("id,title, description, image_header")
    .ilike("title", `%${keyword}%`)
    .limit(5);

  if (error) {
    console.error("Search error:", error);
    return;
  }

  renderResults(data);
}

//dropdown search
function renderResults(items) {
  results.innerHTML = "";

  if (!items || items.length === 0) {
    results.innerHTML = `<div class="search-item">No results</div>`;
    results.style.display = "block";
    return;
  }

  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "search-item";

    div.innerHTML = `
      <img src="${item.image_header || 'https://via.placeholder.com/60'}" class="search-thumb">
      <div class="search-content">
        <div class="search-title">${item.title}</div>
        <div class="search-desc">${(item.description || '').slice(0, 60)}...</div>
      </div>
    `;

    div.onclick = () => {
      window.location.href = `project.html?id=${item.id}`;
    };

    results.appendChild(div);
  });

  results.style.display = "block";
}

// close search
document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-widget")) {
    results.style.display = "none";
  }
});

//Thumbnail
function extractYouTubeID(url) {
    const regExp =
        /(?:youtube\.com\/.*[?&]v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\n?#]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
}

async function renderVideo() {
    const videoLink = document.getElementById("YTVideo");
    const thumbnailDiv = document.getElementById("YTThumbnail");
    const thumbnailImg = document.getElementById("YTImage");

    // guard (hindarin crash)
    if (!videoLink || !thumbnailDiv || !thumbnailImg) {
        console.error("HTML element missing");
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from("stem_projects")
            .select("youtube_link")
            .eq("id",id)
            .limit(1)
            .maybeSingle();

        if (error) throw error;

        if (!data?.youtube_link) {
            console.warn("No YouTube link found");
            return;
        }

        const url = data.youtube_link.trim();

        // set tombol
        videoLink.href = url;
        videoLink.target = "_blank";

        const videoId = extractYouTubeID(url);

        if (!videoId) {
            console.warn("Invalid YouTube URL:", url);
            return;
        }

        // preload thumbnail
        const img = new Image();
        const maxRes = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        const fallback = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

        img.src = maxRes;

        img.onload = () => {
            thumbnailImg.src = maxRes;
            thumbnailDiv.style.display = "block";
        };

        img.onerror = () => {
            thumbnailImg.src = fallback;
            thumbnailDiv.style.display = "block";
        };

        // klik thumbnail
       thumbnailImg.onclick = () => {
    openVideoModal(videoId);
};

videoLink.onclick = (e) => {
    e.preventDefault();
    openVideoModal(videoId);
};

    } catch (err) {
        console.error("Render video failed:", err);
    }
}
document.addEventListener("DOMContentLoaded", renderVideo);

function openVideoModal(videoId) {
    if (!videoId) {
        console.error("Video ID kosong!");
        return;
    }

    const frame = document.getElementById("videoFrame");
    const modalEl = document.getElementById("videoModal");

    const embedURL = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;

    console.log("EMBED:", embedURL);

    frame.src = embedURL;

    const modal = new bootstrap.Modal(modalEl);
    modal.show();
};

document.addEventListener("DOMContentLoaded", () => {
    const modalEl = document.getElementById("videoModal");
    const frame = document.getElementById("videoFrame");

    modalEl.addEventListener("hidden.bs.modal", () => {
        frame.src = "";
    });
});

let galleryImages = [];
let currentIndex = 0;
function openLightbox(index = 0) {
   console.log("Gallery:", galleryImages); // 🔥 cek ini
  console.log("Index:", index);
  currentIndex = index;

  document.getElementById("lightboxModal").classList.remove("d-none");
  showImage();
}

function closeLightbox() {
  document.getElementById("lightboxModal").classList.add("d-none");
}

function showImage() {
    console.log("Show image:", galleryImages[currentIndex]);

  document.getElementById("lightboxImage").src = galleryImages[currentIndex];
}

function nextImage() {
  currentIndex = (currentIndex + 1) % galleryImages.length;
  showImage();
}

function prevImage() {
  currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
  showImage();
}
document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("openGallery").onclick = (e) => {
    e.preventDefault();
    console.log("CLICKED");
    openLightbox(0);
  };

  document.getElementById("closeLightbox").onclick = closeLightbox;
  document.getElementById("nextImage").onclick = nextImage;
  document.getElementById("prevImage").onclick = prevImage;

});
console.log(
  document.getElementById("lightboxModal").getBoundingClientRect()
);