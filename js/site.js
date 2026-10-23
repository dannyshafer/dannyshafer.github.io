(function () {
    var y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();

    var root = document.documentElement;
    window.addEventListener("pointermove", function (e) {
        root.style.setProperty("--mx", e.clientX + "px");
        root.style.setProperty("--my", e.clientY + "px");
    });

    document.querySelectorAll(".card").forEach(function (c) {
        c.addEventListener("pointermove", function (e) {
            var r = c.getBoundingClientRect();
            c.style.setProperty("--cx", e.clientX - r.left + "px");
            c.style.setProperty("--cy", e.clientY - r.top + "px");
        });
    });

    var items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
        items.forEach(function (el) { el.classList.add("in"); });
        return;
    }
    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
            if (en.isIntersecting) {
                en.target.classList.add("in");
                io.unobserve(en.target);
            }
        });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
})();
