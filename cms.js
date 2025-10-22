document.addEventListener("DOMContentLoaded", (e) => {
  console.log("DOM fully loaded and parsed");

  fetch("https://prw-studio-cms.vercel.app/api/projects")
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok: " + response.status);
      }
      return response.json();
    })
    .then(data => {
      console.log("Projects API response:", data);
    })
    .catch(error => {
      console.error("Error fetching projects:", error);
    });
});