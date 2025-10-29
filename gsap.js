document.addEventListener("DOMContentLoaded", (e) => {
    // gsap.registerPlugin(SplitText);
    
    let forward = false;
    let targetY;
    let tweens = [];

    const prjCanvas = document.getElementById('prj-canvas');
    const projects = document.querySelectorAll("li");
    // targetY = projects[3].offsetTop;

    // projects.forEach(function (project) {
    //     let posY = project.offsetTop;
    //     let dist = targetY - posY;
    //     let projectID = "#" + project.id.toString();

    //     const t = gsap.to(projectID, {
    //         y: dist,
    //         duration: 0.66,
    //         // ease: "back(1)",
    //         stagger: { each: 0.11 },
    //         paused: true
    //     });

    //     tweens.push(t);
    // });

    // prjCanvas.addEventListener("click", () => {
    //     forward = !forward;
    //     tweens.forEach(t => {
    //         if (!forward) {
    //             t.reverse();
    //         } else {
    //             t.play();
    //         }
    //     });
    // });
});