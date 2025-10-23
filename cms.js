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
      const projects = data.docs;
      // console.log(projects);
      for (let project of projects) {
        let title, blurb;
        let insights = [], specialities = [], tools = [], aesthetics = [];

        // Extract title and blurb text
        title = project.title;
        blurb = extractTextFromRichText(project.blurb);

        // Extract insights texts
        if (project.insight && Array.isArray(project.insight)) {
          project.insight.forEach(insight => {
            if (insight.text) {
              insights.push(insight.text);
            }
          });
        }
        // console.log(insights);

        // Extract tags from their specific tag categories
        if (project.tags && Array.isArray(project.tags)) {
          project.tags.forEach(tag => {
            if (tag.category === "speciality" && tag.name) {
              specialities.push(tag.name);
            } else if (tag.category === "tool" && tag.name) {
              tools.push(tag.name);
            } else if (tag.category === "aesthetic" && tag.name) {
              aesthetics.push(tag.name);
            }
          });
        }
        // console.log(aesthetics);
        
      }
    })
    .catch(error => {
      console.error("Error fetching projects:", error);
    });
});

function extractTextFromRichText(richText) {
  if (!richText?.root?.children) return '';
  return richText.root.children.flatMap(child =>
    child.children?.map(c => c.text).join('') || ''
  ).join('\n');
  // Below is the "hard-coded" way to extract blurb text
  // console.log(projects[2].blurb.root.children[0].children[0].text);
}