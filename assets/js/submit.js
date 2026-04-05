async function uploadImages(headerFile, authorFile){

const headerReader = new FileReader()
const authorReader = new FileReader()

return new Promise((resolve)=>{

headerReader.onload = async function(){

authorReader.onload = async function(){

const res = await fetch("https://defaultc1ec01f235254499b71b3f746dd99f.8d.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/25e092709a8d43c5bb33e2a5887340c7/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=d7AACVyjHPgMluU3XBfTEWi_103t8J50SFM5tprS2T4",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
headerFileName: headerFile.name,
headerFileContent: headerReader.result.split(",")[1],
authorFileName: authorFile.name,
authorFileContent: authorReader.result.split(",")[1]
})
})

const data = await res.json()

resolve(data)

}

authorReader.readAsDataURL(authorFile)

}

headerReader.readAsDataURL(headerFile)

})

}



$("#createPostForm").on("submit", async function (e) {

e.preventDefault()

showToast("Uploading...","loading")

const headerFile = document.getElementById("postImageHeader").files[0]
const authorFile = document.getElementById("postAuthorImage").files[0]

let headerUrl=""
let authorUrl=""

try{

if(headerFile || authorFile){

const result = await uploadImages(headerFile,authorFile)

headerUrl = result.headerUrl
authorUrl = result.authorUrl

}

showToast("Saving project...","loading")

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
youtube_link: $("#postVideo").val(),
moodle_link: $("#postMoodle").val(),
research_pdf: $("#postResearch").val(),
moodle_key: $("#keyMoodle").val()
}

const { data, error } = await supabaseClient
.from("stem_projects")
.insert([projectData])
.select()

if(error){
showToast("Project failed to publish: "+error.message,"danger")
return
}

const newId = data[0].id

showToast("Project published successfully!","success")

setTimeout(()=>{
window.location.href = `project.html?id=${newId}`
},2000)

}catch(err){

console.error(err)
showToast("Upload failed. Please try again.","danger")

}

})