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
      let count = 0;
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

        // CREATE AND INSERT HTML ELEMENTS HERE
        const projectsList = document.getElementById('projects');
        addPrjIndexEl(projectsList, count, title, specialities, tools, aesthetics);
        count++;
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

function addPrjIndexEl(parentEl, index, title, specialities, tools, aesthetics) {
  const newLi = document.createElement("li");
  newLi.classList.add("prj-deets");
  const newLiID = "prj" + (index + 1).toString();
  newLi.setAttribute("id", newLiID);

  for (let i = 0; i < 4; i++) {
    let span;
    if (i === 0) {
      span = document.createElement("span");
      span.className = "prj-title";
      span.textContent = title;
    } else if (i === 1) {
      span = document.createElement("span");
      span.className = "prj-specs";
      span.textContent = specialities.join(", ");
    } else if (i === 2) {
      span = document.createElement("span");
      span.className = "prj-tools";
      span.textContent = tools.join(", ");
    } else if (i === 3) {
      span = document.createElement("span");
      span.className = "prj-aesths";
      span.textContent = aesthetics.join(", ");
    }
    newLi.appendChild(span);
  }

  parentEl.appendChild(newLi);
}