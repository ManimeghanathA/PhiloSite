function locomotive() {
  gsap.registerPlugin(ScrollTrigger);

  const locoScroll = new LocomotiveScroll({
    el: document.querySelector("#main"),
    smooth: true,
  });

  locoScroll.on("scroll", ScrollTrigger.update);

  ScrollTrigger.scrollerProxy("#main", {
    scrollTop(value) {
      return arguments.length
        ? locoScroll.scrollTo(value, 0, 0)
        : locoScroll.scroll.instance.scroll.y;
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    },
    pinType: document.querySelector("#main").style.transform
      ? "transform"
      : "fixed",
  });

  ScrollTrigger.addEventListener("refresh", () => locoScroll.update());
  ScrollTrigger.refresh();
}
locomotive();

// Canvas setup
const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");

function setCanvasSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
setCanvasSize();

let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    setCanvasSize();
    render();
  }, 100);
});

// Filenames array
const filenames = [
  ...Array.from(
    { length: 100 },
    (_, i) => `images_2k/${String(i + 1).padStart(4, "0")}.png`
  ),
  ...Array.from(
    { length: 100 },
    (_, i) => `images_2k/2${String(i + 1).padStart(4, "0")}.png`
  ),
  ...Array.from(
    { length: 100 },
    (_, i) => `images_2k/3${String(i + 1).padStart(4, "0")}.png`
  ),
];

const frameCount = filenames.length;
const images = [];
const imageSeq = { frame: 0 };

// Preload images
filenames.forEach((file, i) => {
  const img = new Image();
  img.src = file;
  images[i] = img;
});

let lastFrame = -1;
function render() {
  const img = images[imageSeq.frame];
  if (!img || imageSeq.frame === lastFrame) return;
  lastFrame = imageSeq.frame;
  scaleImage(img, context);
}

function scaleImage(img, ctx) {
  const canvas = ctx.canvas;
  const hRatio = canvas.width / img.width;
  const vRatio = canvas.height / img.height;
  const ratio = Math.max(hRatio, vRatio);
  const centerShiftX = (canvas.width - img.width * ratio) / 2;
  const centerShiftY = (canvas.height - img.height * ratio) / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(
    img,
    0,
    0,
    img.width,
    img.height,
    centerShiftX,
    centerShiftY,
    img.width * ratio,
    img.height * ratio
  );
}

function setupScrollAnimation() {
  const animationDuration = window.innerWidth > 768 ? 0.15 : 0.3;

  gsap.to(imageSeq, {
    frame: frameCount - 1,
    snap: "frame",
    ease: "none",
    scrollTrigger: {
      scrub: animationDuration,
      trigger: "#page>canvas",
      start: "top top",
      end: "600% top",
      scroller: "#main",
    },
    onUpdate: render,
  });

  ScrollTrigger.create({
    trigger: "#page>canvas",
    pin: true,
    scroller: "#main",
    start: "top top",
    end: "600% top",
  });

  const pages = ["#page1", "#page2", "#page3"];
  const shouldPin = window.innerWidth > 768;

  pages.forEach((selector) => {
    gsap.to(selector, {
      scrollTrigger: {
        trigger: selector,
        start: "top top",
        end: "bottom top",
        pin: shouldPin,
        scroller: "#main",
      },
    });
  });
}

images[0].onload = () => {
  render();
  setupScrollAnimation();
};
