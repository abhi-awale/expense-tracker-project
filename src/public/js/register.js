//   function flipCard() {
//     document.getElementById("card").classList.toggle("flipped");
//   }
document.addEventListener("mousemove", (e) => {
    const blobs = document.querySelectorAll(".blob");

    const x = (window.innerWidth / 2 - e.clientX) / 20;
    const y = (window.innerHeight / 2 - e.clientY) / 20;

    blobs.forEach(blob => {
        const depth = blob.getAttribute("data-depth");

        const moveX = x * (depth / 50);
        const moveY = y * (depth / 50);

        blob.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
});