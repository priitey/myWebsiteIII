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
      const prjTags = projects.tags;
      let count = 0;
      // console.log(projects);
      const projectsList = document.getElementById('projects');
      const tagContainers = document.querySelectorAll('.tag-container');
      const specTagsEl = document.getElementById('specialty-tags');
      const toolTagsEl = document.getElementById('tool-tags');
      const aesthsTagsEl = document.getElementById('aesthetic-tags');

      // remove text content
      tagContainers.forEach(container => {
        for (let child of [...container.childNodes]) {
          if (child.nodeType === Node.TEXT_NODE) {
            container.removeChild(child);
          }
        }
      });
      for (let child of [...projectsList.childNodes]) {  // Use spread to avoid live NodeList issues
        if (child.nodeType === Node.TEXT_NODE) {
          projectsList.removeChild(child);
        }
      }

      // Collect unique tags across all projects
      const allSpecialities = new Set();
      const allTools = new Set();
      const allAesthetics = new Set();

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

        // Extract tags from their specific tag categories
        if (project.tags && Array.isArray(project.tags)) {
          project.tags.forEach(tag => {
            if (tag.category === "speciality" && tag.name) {
              specialities.push(tag.name);
              allSpecialities.add(tag.name);
            } else if (tag.category === "tool" && tag.name) {
              tools.push(tag.name);
              allTools.add(tag.name);
            } else if (tag.category === "aesthetic" && tag.name) {
              aesthetics.push(tag.name);
              allAesthetics.add(tag.name);
            }
          });
        }

        project.specialities = specialities;
        project.tools = tools;
        project.aesthetics = aesthetics;

        // CREATE AND INSERT HTML ELEMENTS HERE
        addPrjIndexEl(projectsList, count, title, specialities, tools, aesthetics);
        count++;
      }

      // Add unique tag lists once after processing all projects
      addPrjSpecTags(specTagsEl, Array.from(allSpecialities));
      addPrjToolsTags(toolTagsEl, Array.from(allTools));
      addPrjAesthsTags(aesthsTagsEl, Array.from(allAesthetics));

      // Store project data for sorting (including DOM elements)
      const projectData = projects.map((project, index) => {
        const element = document.getElementById('prj' + (index + 1));
        const allTags = new Set([...(project.specialities || []), ...(project.tools || []), ...(project.aesthetics || [])]);
        return { project, element, allTags };
      });

      // Set to track selected tags
      const selectedTags = new Set();

      // Function to calculate match count for a project
      function getMatchCount(projectTags, selectedTags) {
        return [...projectTags].filter(tag => selectedTags.has(tag)).length;
      }

      function sortAndReorderProjects() {
        // Calculate match counts
        projectData.forEach(data => {
          data.matchCount = getMatchCount(data.allTags, selectedTags);
        });

        // Sort: first by match count (descending), then by title (ascending)
        projectData.sort((a, b) => {
          if (b.matchCount !== a.matchCount) {
            return b.matchCount - a.matchCount; // Higher match count first
          }
          return a.project.title.localeCompare(b.project.title); // Alphabetical by title
        });

        // Reorder DOM elements with animation
        const projectsList = document.getElementById('projects');
        
        // Record initial positions (First)
        const initialPositions = projectData.map(data => {
          const rect = data.element.getBoundingClientRect();
          return { element: data.element, top: rect.top, left: rect.left };
        });
        
        // Append in new sorted order (Last)
        projectData.forEach(data => {
          projectsList.appendChild(data.element);
        });
        // Invert and animate (Invert & Play)
        projectData.forEach((data, index) => {
          let animInit, animation;
          animation && animation.revert();
          const newRect = data.element.getBoundingClientRect();
          const initial = initialPositions.find(pos => pos.element === data.element);
          const deltaX = initial.left - newRect.left;
          const deltaY = initial.top - newRect.top;
        
          // Set initial transform to invert position
          animInit = gsap.set(data.element, { x: deltaX, y: deltaY });
        
          // Animate to new position
          animation = gsap.to(data.element, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: "power2.out"
          });
        });
      }

      // Add event listeners to all tag checkboxes
      const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
      allCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
          // Derive tag name from the associated span's text content
          const span = checkbox.parentElement.querySelector('.tag-txt');
          const tagName = span ? span.textContent : '';

          if (checkbox.checked) {
            selectedTags.add(tagName);
          } else {
            selectedTags.delete(tagName);
          }
          sortAndReorderProjects(); // Resort on every change
        });
      });

      // Initial sort (no tags selected, so alphabetical by title)
      sortAndReorderProjects();
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
  if (!parentEl) return;

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

function addPrjSpecTags(parentEl, specialities) {
  if (!parentEl || !Array.isArray(specialities)) return;

  const newUl = document.createElement("ul");
  newUl.classList.add("tags-list");

  specialities.forEach(speciality => {
    const newLi = document.createElement("li");

    const newLabel = document.createElement("label");
    newLabel.htmlFor = speciality.replace(/\s+/g, '-'); // Sanitize for valid ID

    const newInput = document.createElement("input");
    newInput.type = "checkbox";
    newInput.id = speciality.replace(/\s+/g, '-');
    newInput.name = speciality.replace(/\s+/g, '-');

    const newSpan = document.createElement("span");
    newSpan.classList.add("tag-txt");
    newSpan.textContent = speciality; // Set the tag text

    newLabel.appendChild(newInput);
    newLabel.appendChild(newSpan);
    newLi.appendChild(newLabel);
    newUl.appendChild(newLi);
  });

  parentEl.appendChild(newUl); // Append the UL to the parent
}
function addPrjToolsTags(parentEl, tools) {
  if (!parentEl || !Array.isArray(tools)) return;

  const newUl = document.createElement("ul");
  newUl.classList.add("tags-list");

  tools.forEach(speciality => {
    const newLi = document.createElement("li");

    const newLabel = document.createElement("label");
    newLabel.htmlFor = speciality.replace(/\s+/g, '-'); // Sanitize for valid ID

    const newInput = document.createElement("input");
    newInput.type = "checkbox";
    newInput.id = speciality.replace(/\s+/g, '-');
    newInput.name = speciality.replace(/\s+/g, '-');

    const newSpan = document.createElement("span");
    newSpan.classList.add("tag-txt");
    newSpan.textContent = speciality; // Set the tag text

    newLabel.appendChild(newInput);
    newLabel.appendChild(newSpan);
    newLi.appendChild(newLabel);
    newUl.appendChild(newLi);
  });

  parentEl.appendChild(newUl); // Append the UL to the parent
}
function addPrjAesthsTags(parentEl, aesthetics) {
  if (!parentEl || !Array.isArray(aesthetics)) return;

  const newUl = document.createElement("ul");
  newUl.classList.add("tags-list");

  aesthetics.forEach(speciality => {
    const newLi = document.createElement("li");

    const newLabel = document.createElement("label");
    newLabel.htmlFor = speciality.replace(/\s+/g, '-'); // Sanitize for valid ID

    const newInput = document.createElement("input");
    newInput.type = "checkbox";
    newInput.id = speciality.replace(/\s+/g, '-');
    newInput.name = speciality.replace(/\s+/g, '-');

    const newSpan = document.createElement("span");
    newSpan.classList.add("tag-txt");
    newSpan.textContent = speciality; // Set the tag text

    newLabel.appendChild(newInput);
    newLabel.appendChild(newSpan);
    newLi.appendChild(newLabel);
    newUl.appendChild(newLi);
  });

  parentEl.appendChild(newUl); // Append the UL to the parent
}