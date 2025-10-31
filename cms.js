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
      const projectsList = document.getElementById('projects');
      const tagContainers = document.querySelectorAll('.tag-container');

      const specTagsEl = document.getElementById('specialty-tags');
      const toolTagsEl = document.getElementById('tool-tags');
      const aesthsTagsEl = document.getElementById('aesthetic-tags');

      const prjTitleEl = document.getElementById('info-title');
      const prjTagsEl = document.getElementById('info-tags');
      const prjBlurbEl = document.getElementById('info-blurb');
      const prjGallery = document.getElementById('gallery');
      // remove text content
      tagContainers.forEach(container => {
        for (let child of [...container.childNodes]) {
          if (child.nodeType === Node.TEXT_NODE) {
            container.removeChild(child);
          }
        }
      });
      for (let child of [...projectsList.childNodes]) {
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
        let insights = [], specialities = [], tools = [], aesthetics = [], visuals = [];

        // Extract title and blurb text
        title = project.title;
        blurb = extractRichTextAsHTML(project.blurb);

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

        // Extract visuals
        if (project.visual && Array.isArray(project.visual)) {
          project.visual.forEach(vis => {
            if (vis.visual) {
              visuals.push(vis.visual); // Push the image object (with url, alt, etc.)
            }
          });
        }

        project.specialities = specialities;
        project.tools = tools;
        project.aesthetics = aesthetics;
        project.visuals = visuals;

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

      const selectedTags = new Set();

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

      const indexElTitles = document.querySelectorAll('.prj-title');
      const fullImgCtr = document.getElementById('floaty-img-wrapper');
      const fullImg = document.getElementById('floaty-img');
      indexElTitles.forEach(titleEl => {
        titleEl.addEventListener('click', () => {
          const li = titleEl.closest('li');
          const project = projectData.find(data => data.element === li)?.project;
          // console.log('Project title clicked:', titleEl.textContent);
          if (project) {
            prjTitleEl.textContent = project.title;
            prjTagsEl.textContent = [...project.specialities, ...project.tools, ...project.aesthetics].join(', ');
            prjBlurbEl.innerHTML = extractRichTextAsHTML(project.blurb);
            // console.log('Blurb object:', project.blurb);
            // console.log('Extracted HTML:', extractRichTextAsHTML(project.blurb));
            updateGallery(prjGallery, project.visuals);
            document.getElementById('prj-info').style.display = 'block';

            // Add event listeners to the newly added gallery images
            const prjImgs = prjGallery.querySelectorAll('.a-prj-visual');
            prjImgs.forEach(prjImg => {
              prjImg.addEventListener("click", () => {
                console.log("img clicked");
                fullImg.src = prjImg.src;  // Set the image source
                fullImgCtr.style.display = "block";
              });
            });
          }
        });
      });
      fullImgCtr.addEventListener("click", () => {
        fullImgCtr.style.display = "none";
      });
    })
    .catch(error => {
      console.error("Error fetching projects:", error);
    });
});

function extractRichTextAsHTML(richText) {
  if (!richText?.root?.children) return '';
  return richText.root.children.flatMap(paragraph => {
    if (paragraph.children) {
      return paragraph.children.map(child => {
        if (child.type === 'autolink' && child.fields?.url) {
          // Handle autolinks: extract URL and text from children
          const linkText = child.children?.[0]?.text || child.fields.url;
          return `<a href="${child.fields.url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
        } else if (child.type === 'text' && child.text) {
          // Handle plain text
          return child.text;
        }
        return '';
      }).join('');
    }
    return '';
  }).join('\n');
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

function updateGallery(el, gallery) {
  el.textContent = '';
  if (gallery && Array.isArray(gallery)) {
    gallery.forEach(item => {
      let mediaElement;
      if (item.mimeType && item.mimeType.startsWith('video/')) {
        // Create video element for videos
        mediaElement = document.createElement('video');
        mediaElement.src = "https://prw-studio-cms.vercel.app/" + item.url;
        mediaElement.controls = true; // Add controls for play/pause
        mediaElement.preload = 'metadata'; // Load metadata for better UX
        mediaElement.style.maxWidth = '100%';
        mediaElement.style.height = 'auto';
        mediaElement.style.maxHeight = '55%';
        mediaElement.style.background = 'var(--bg)';
        mediaElement.classList.add("a-prj-visual");
      } else {
        // Create img element for images
        mediaElement = document.createElement('img');
        mediaElement.src = "https://prw-studio-cms.vercel.app/" + item.url;
        mediaElement.alt = item.alt || 'Project image';
        mediaElement.style.maxWidth = '100%';
        mediaElement.style.height = 'auto';
        mediaElement.style.maxHeight = '55%';
        mediaElement.style.objectFit = 'cover';
        mediaElement.style.background = 'var(--alt)';
        mediaElement.style.cursor = 'pointer';
        mediaElement.classList.add("a-prj-visual");
      }
      el.appendChild(mediaElement);
    });
  } else {
    el.textContent = 'No gallery available';
  }
}