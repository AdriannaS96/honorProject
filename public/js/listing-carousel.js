document.addEventListener("DOMContentLoaded", function() {
  const thumbs = document.querySelectorAll(".thumb-img");

  thumbs.forEach(thumb => {
    thumb.addEventListener("click", () => {
      const index = Array.from(thumb.parentNode.children).indexOf(thumb);
      const carousel = bootstrap.Carousel.getOrCreateInstance(document.getElementById("listingCarousel"));
      carousel.to(index);
    });
  });
});
