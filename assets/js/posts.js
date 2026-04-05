// filter grade

document.getElementById("junior").addEventListener("change", function() {
    document.getElementById("junior-grades").style.display = "block";
    document.getElementById("senior-grades").style.display = "none";
});

document.getElementById("senior").addEventListener("change", function() {
    document.getElementById("senior-grades").style.display = "block";
    document.getElementById("junior-grades").style.display = "none";
});


const { createClient } = supabase;

const supabaseClient = createClient(
  "https://tiiprawotipmnqdwfdpi.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpaXByYXdvdGlwbW5xZHdmZHBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMTQ0MTgsImV4cCI6MjA4NzU5MDQxOH0.jcZkmEX8JnIh8qMIyEY4mQGj1UNh9xOSsdh0HabzReI"
);


let currentPage = 1;
const limit = 4;
let filters = {
  level: null,
  grades: [],
  search: ""
};
filters.category = null;
filters.year = null;

async function loadSidebarData() {

  const { data, error } = await supabaseClient
    .from("stem_projects")
    .select("school_year, category");

  if (error) {
    console.error(error);
    return;
  }

  renderCategories(data);
  renderYears(data);
}
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
//school year count sidebar
function renderYears(data) {

  const yearMap = {};

  data.forEach(item => {
    if (!item.school_year) return;

    if (!yearMap[item.school_year]) {
      yearMap[item.school_year] = 0;
    }

    yearMap[item.school_year]++;
  });

  const container = document.getElementById("yearList");
  container.innerHTML = "";

  Object.keys(yearMap).forEach(year => {
    container.innerHTML += `
      <li>
        <a href="#" onclick="filterYear('${year}')">
          ${year}
          <span>${yearMap[year]}</span>
        </a>
      </li>
    `;
  });
}

loadSidebarData();


async function loadProjects(page = 1) {

  currentPage = page;

  let query = supabaseClient
    .from("stem_projects")
    .select("*", { count: "exact" });

function filterCategory(cat) {
  filters.category = cat;
  currentPage = 1;
  loadProjects(1);
}

function filterYear(year) {
  filters.year = year;
  currentPage = 1;
  loadProjects(1);
}
  // FILTER LEVEL
  if (filters.level) {
    query = query.eq("school_level", filters.level);
  }

  //FILTER GRADE (multi)
  if (filters.grades.length > 0) {
    query = query.in("school_grade", filters.grades);
  }
  //FILTER SEARCH (title & description)
    if (filters.search) {query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);}
    const searchInput = document.getElementById("searchInput");
// FILTER CATEGORY
if (filters.category) {
  query = query.eq("category", filters.category);
}
// FILTER YEAR
if (filters.year) {
  query = query.eq("school_year", filters.year);
}
searchInput.addEventListener("input", debounce(function () {

  filters.search = this.value.trim();

  currentPage = 1;
  loadProjects(1);

}, 400));
function debounce(func, delay) {
  let timeout;

  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}



  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query
    .range(from, to)
    .order("id", { ascending: false });

  const container = document.getElementById("projectContainer");
  const pagination = document.getElementById("paginationWrapper");

  if (error) {
    console.error(error);
    return;
  }


  //EMPTY
  if (!data || data.length === 0) {
    container.innerHTML = ` <div class="text-center py-5">
      
      <div class="mb-3">
        <i class="bi bi-folder-x" style="font-size: 48px; color:#adb5bd;"></i>
      </div>

      <h4 class="fw-bold mb-2">No Projects Found</h4>
      
      <p class="text-muted mb-3">
        We couldn't find any STEM projects based on your filter.<br>
        Try adjusting your filters, keywords or add your STEM project if you're admin.
      </p>

      <button class="btn btn-primary px-4 py-2" style="background-color: #192553" onclick="resetFilter()">
        <i class="bi bi-arrow-clockwise me-1"></i>
        Reset Filters
      </button>

    </div>
  
    `;
    pagination.style.display = "none";
    return;
  }

  //RENDER DATA
  container.innerHTML = "";

  data.forEach(project => {

    const plainText = project.description
      ? project.description.replace(/<[^>]*>/g, '')
      : "";

    container.innerHTML += `
      <div class="post format-standard-image">
        <div class="entry-media">
          <img src="${project.image_header}" alt="">
        </div>

        <div class="entry-meta">
          <ul>
            <li><i class="fi flaticon-user"></i>By ${project.author}</li>
            <li><i class="fa fa-graduation-cap"></i> ${project.school_grade}</li>
            <li><i class="fas fa-atom"></i> ${project.category}</li>
            <li><i class="fa-solid fa-location-dot"></i> ${project.school}</li>
          </ul>
        </div>

        <div class="entry-details">
          <h3>
            <a href="project.html?id=${project.id}">
              ${project.title}
            </a>
          </h3>

          <p>${plainText.substring(0, 350)}... <br>Read More</p>
           <a href="project.html?id=${project.id}" class="read-more">READ MORE...</a>
        </div>
      </div>
    `;
    pagination.style.display = "block"
  });

  // Pagination
  renderPagination(count, page);
}
document.querySelectorAll(".filter-check").forEach(cb => {
  cb.addEventListener("change", function () {

    const value = this.value;

    if (this.checked) {
      filters.grades.push(value);
    } else {
      filters.grades = filters.grades.filter(g => g !== value);
    }

    currentPage = 1;
    loadProjects(1);
  });
});

function resetFilter() {

  // reset state JS
  filters = {
    level: null,
    grades: []
  };

  // reset radio (level)
  document.querySelectorAll("input[name='level']").forEach(r => {
    r.checked = false;
  });

  // reset checkbox (grade)
  document.querySelectorAll(".filter-check").forEach(cb => {
    cb.checked = false;
  });

  // reset UI tambahan (kalau ada show/hide grade)
  document.getElementById("junior-grades").style.display = "none";
  document.getElementById("senior-grades").style.display = "none";

  // balik ke page 1
  currentPage = 1;

  // reload data
  loadProjects(1);
}
function renderPagination(totalItems, currentPage) {

  const totalPages = Math.ceil(totalItems / limit);
  const pagination = document.querySelector(".pg-pagination");
  const maxVisible = 5;

  pagination.innerHTML = "";
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = start + maxVisible - 1;

  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - maxVisible + 1);
  }
  // PREV
  if (currentPage > 1) {
    pagination.innerHTML += `
      <li>
        <a href="#" onclick="changePage(${currentPage - 1})">
          <i class="fi ti-angle-left"></i>
        </a>
      </li>
    `;
  }

  // NUMBER
  for (let i = 1; i <= totalPages; i++) {
    pagination.innerHTML += `
      <li class="${i === currentPage ? 'active' : ''}">
        <a href="#" onclick="changePage(${i})">${i}</a>
      </li>
    `;
  }

  // NEXT
  if (currentPage < totalPages) {
    pagination.innerHTML += `
      <li>
        <a href="#" onclick="changePage(${currentPage + 1})">
          <i class="fi ti-angle-right"></i>
        </a>
      </li>
    `;
  }
}

function changePage(page) {
  currentPage = page;
  loadProjects(page);

  // scroll ke atas biar smooth
  window.scrollTo({ top: 0, behavior: "smooth" });
}



loadProjects(1);


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