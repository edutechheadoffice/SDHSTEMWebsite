async function uploadFile(file, folder) {
  if (!file) return "";

  const filePath = `${folder}/${Date.now()}_${file.name}`;

  const { error } = await supabaseClient.storage
    .from("stem-images")
    .upload(filePath, file);

  if (error) throw error;

  const { data } = supabaseClient.storage
    .from("stem-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
}


$("#createPostForm").on("submit", async function (e) {
  e.preventDefault();

  showToast("Uploading...", "loading");

  const headerFile = document.getElementById("postImageHeader").files[0];
  const authorFile = document.getElementById("postAuthorImage").files[0];
  const pdfFile = document.getElementById("postResearch").files[0];

  let headerUrl = "";
  let authorUrl = "";
  let pdfUrl = "";

  try {
    // paralel upload
    const [h, a, p] = await Promise.all([
      uploadFile(headerFile, "headers"),
      uploadFile(authorFile, "authors"),
      uploadFile(pdfFile, "pdfs")
    ]);

    headerUrl = h;
    authorUrl = a;
    pdfUrl = p;

    showToast("Saving project...", "loading");

    const projectData = {
      title: $("#postTitle").val(),
      author: $("#postAuthor").val(),
      school: $("#postSchool").val(),
      school_year: $("#postSchoolYear").val(),
      category: $("#postCategory").val(),
      tags: $("#postTags").val(),
      school_level: $("#postSchoolLevel").val(),
      school_grade: $("#postSchoolGrade").val(),
      description: window.quill.root.innerHTML,
      image_header: headerUrl,
      author_image: authorUrl,
      research_pdf: pdfUrl,
      youtube_link: $("#postVideo").val(),
      moodle_link: $("#postMoodle").val(),
      moodle_key: $("#keyMoodle").val()
    };

    const { data, error } = await supabaseClient
      .from("stem_projects")
      .insert([projectData])
      .select();

    if (error) {
      showToast("Project failed: " + error.message, "danger");
      return;
    }

    const newId = data[0].id;

    showToast("Project published successfully!", "success");

    setTimeout(() => {
      window.location.href = `project.html?id=${newId}`;
    }, 2000);

  } catch (err) {
    console.error(err);
    showToast("Upload failed. Please try again.", "danger");
  }
});