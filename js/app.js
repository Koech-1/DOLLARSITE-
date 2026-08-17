// Smooth scrolling for navigation links
document.querySelectorAll('a[href="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
    });
});

// Fade-in animation on page load
window.addEventListener("load", () => {
    document.body.style.opacity = "1";
});

document.body.style.opacity = "0";
document.body.style.transition = "opacity 1s ease";

// Animated statistics counter
const counters = document.querySelectorAll(".statistics h2");

counters.forEach(counter => {
    const target = counter.innerText;
    const numericValue = parseInt(target.replace(/[^0-9]/g, ""));

    let count = 0;

    const updateCounter = () => {
        if (count < numericValue) {
            count += Math.ceil(numericValue / 100);

            if (count > numericValue) count = numericValue;

            if (target.includes("$")) {
                counter.innerText = "$" + count + "M+";
            } else if (target.includes("%")) {
                counter.innerText = count + "%";
            } else {
                counter.innerText = count + "K+";
            }

            requestAnimationFrame(updateCounter);
        }
    };

    updateCounter();
});

// Hero button animation
const startButton = document.querySelector(".start");

if (startButton) {
    startButton.addEventListener("mouseover", () => {
        startButton.style.transform = "scale(1.05)";
    });

    startButton.addEventListener("mouseout", () => {
        startButton.style.transform = "scale(1)";
    });
}