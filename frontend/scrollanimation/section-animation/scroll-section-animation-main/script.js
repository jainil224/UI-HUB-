
gsap.registerPlugin(ScrollTrigger);

const sections = document.querySelectorAll(".panel");

sections.forEach((section, index) => {
  const container = section.querySelector(".container");

  gsap.to(container, {
    rotate: 0,
    ease: "none",
    scrollTrigger: {
      trigger: section,
      start: "top bottom",
      end: "top center",
      scrub: true
    }
  });

  if(index !== sections.length - 1){
    ScrollTrigger.create({
      trigger: section,
      start: "bottom bottom",
      end: "bottom top",
      pin: true,
      pinSpacing: false
    });
  }
});
