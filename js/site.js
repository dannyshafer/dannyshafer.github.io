/* Daniel Shafer, personal site. Vanilla JS, no dependencies. */
(function () {
    "use strict";

    var root = document.documentElement;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    /* ---------- theme ---------- */
    try {
        var saved = localStorage.getItem("theme");
        if (saved) root.setAttribute("data-theme", saved);
        else if (window.matchMedia("(prefers-color-scheme: light)").matches) root.setAttribute("data-theme", "light");
    } catch (e) {}
    var toggle = document.querySelector(".theme");
    if (toggle) {
        toggle.addEventListener("click", function () {
            var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
            root.setAttribute("data-theme", next);
            try { localStorage.setItem("theme", next); } catch (e) {}
        });
    }

    /* ---------- year + clock ---------- */
    document.querySelectorAll("#year").forEach(function (y) { y.textContent = new Date().getFullYear(); });
    document.querySelectorAll("[data-years-since]").forEach(function (el) {
        el.textContent = new Date().getFullYear() - parseInt(el.getAttribute("data-years-since"), 10);
    });
    var clock = document.querySelector(".clock");
    if (clock) {
        var tick = function () {
            try {
                clock.textContent = "SF " + new Intl.DateTimeFormat("en-US", {
                    timeZone: "America/Los_Angeles", hour: "2-digit", minute: "2-digit", hour12: false
                }).format(new Date());
            } catch (e) { clock.textContent = ""; }
        };
        tick();
        setInterval(tick, 15000);
    }

    /* ---------- scroll progress ---------- */
    var onScroll = function () {
        var h = root.scrollHeight - root.clientHeight;
        root.style.setProperty("--p", h > 0 ? (root.scrollTop / h).toFixed(4) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* ---------- cursor + glow ---------- */
    var cur = document.querySelector(".cursor");
    var ring = document.querySelector(".cursor-ring");
    var mx = window.innerWidth / 2, my = window.innerHeight / 3, rx = mx, ry = my;
    window.addEventListener("pointermove", function (e) {
        mx = e.clientX; my = e.clientY;
        root.style.setProperty("--mx", mx + "px");
        root.style.setProperty("--my", my + "px");
        if (cur) cur.style.transform = "translate(" + (mx - 4) + "px," + (my - 4) + "px)";
    }, { passive: true });
    if (fine && ring && !reduce) {
        (function loop() {
            rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
            ring.style.transform = "translate(" + (rx - ring.offsetWidth / 2) + "px," + (ry - ring.offsetHeight / 2) + "px)";
            requestAnimationFrame(loop);
        })();
        document.querySelectorAll("a, button, .tile, .chip").forEach(function (el) {
            el.addEventListener("pointerenter", function () { document.body.classList.add("is-hovering"); });
            el.addEventListener("pointerleave", function () { document.body.classList.remove("is-hovering"); });
        });
    }

    /* ---------- tiles: spotlight + tilt ---------- */
    document.querySelectorAll(".tile").forEach(function (t) {
        t.addEventListener("pointermove", function (e) {
            var r = t.getBoundingClientRect();
            var x = e.clientX - r.left, y = e.clientY - r.top;
            t.style.setProperty("--cx", x + "px");
            t.style.setProperty("--cy", y + "px");
            if (fine && !reduce) {
                var tx = ((y / r.height) - 0.5) * -4, ty = ((x / r.width) - 0.5) * 4;
                t.style.transform = "perspective(900px) rotateX(" + tx + "deg) rotateY(" + ty + "deg) translateY(-3px)";
            }
        });
        t.addEventListener("pointerleave", function () { t.style.transform = ""; });
    });

    /* ---------- magnetic buttons ---------- */
    if (fine && !reduce) {
        document.querySelectorAll(".btn").forEach(function (b) {
            b.addEventListener("pointermove", function (e) {
                var r = b.getBoundingClientRect();
                var x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
                b.style.transform = "translate(" + x * 0.18 + "px," + y * 0.28 + "px)";
            });
            b.addEventListener("pointerleave", function () { b.style.transform = ""; });
        });
    }

    /* ---------- name: split letters, variable-font ripple ---------- */
    var name = document.querySelector(".name");
    if (name) {
        var words = name.textContent.trim().split(/\s+/);
        name.innerHTML = words.map(function (w) {
            return '<span class="w">' + w.split("").map(function (c) { return '<span class="c">' + c + "</span>"; }).join("") + "</span>";
        }).join(" ");
        var chars = name.querySelectorAll(".c");
        if (fine && !reduce) {
            name.addEventListener("pointermove", function (e) {
                chars.forEach(function (c) {
                    var r = c.getBoundingClientRect();
                    var d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
                    var k = Math.max(0, 1 - d / 220);
                    c.style.setProperty("--wg", Math.round(400 + 500 * k));
                    c.style.setProperty("--sf", Math.round(30 + 70 * k));
                    c.classList.toggle("on", k > 0.75);
                });
            });
            name.addEventListener("pointerleave", function () {
                chars.forEach(function (c) { c.style.removeProperty("--wg"); c.style.removeProperty("--sf"); c.classList.remove("on"); });
            });
        }
    }

    /* ---------- rotating roles with scramble ---------- */
    var role = document.querySelector(".role");
    if (role) {
        var list = (role.getAttribute("data-roles") || "").split("|").filter(Boolean);
        var i = 0, glyphs = "abcdefghijklmnopqrstuvwxyz0123456789";
        var article = document.querySelector(".article");
        var setArticle = function (word) {
            if (article) article.textContent = /^[aeiou]/i.test(word) ? "an" : "a";
        };
        setArticle(role.textContent);
        var scramble = function (to, done) {
            setArticle(to);
            var from = role.textContent, frame = 0, len = Math.max(from.length, to.length);
            var step = function () {
                var out = "";
                for (var k = 0; k < len; k++) {
                    var p = frame / 14;
                    if (k < to.length && k / len < p) out += to[k];
                    else if (k < to.length) out += glyphs[Math.floor(Math.random() * glyphs.length)];
                }
                role.textContent = out;
                if (frame++ < 16) requestAnimationFrame(step); else { role.textContent = to; if (done) done(); }
            };
            step();
        };
        if (list.length > 1 && !reduce) {
            setInterval(function () { i = (i + 1) % list.length; scramble(list[i]); }, 2600);
        }
    }

    /* ---------- reveal on scroll ---------- */
    var items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || reduce) {
        items.forEach(function (el) { el.classList.add("in"); });
    } else {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
            });
        }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
        items.forEach(function (el) { io.observe(el); });
    }

    /* ---------- github tile (fails silently) ---------- */
    var ghTotal = document.querySelector("[data-gh-total]");
    var ghHeat = document.querySelector("[data-gh-heat]");
    if (ghHeat && "fetch" in window) {
        fetch("https://github-contributions-api.jogruber.de/v4/dannyshafer?y=last").then(function (r) { return r.json(); }).then(function (j) {
            var days = (j && j.contributions) || [];
            if (!days.length) return;
            if (ghTotal && j.total && j.total.lastYear != null) {
                ghTotal.textContent = Number(j.total.lastYear).toLocaleString("en-US");
                document.querySelector("[data-gh-big]").hidden = false;
                document.querySelectorAll("[data-gh-fallback]").forEach(function (el) { el.hidden = true; });
            }
            /* pad to a Sunday so the grid columns are calendar weeks */
            var pad = new Date(days[0].date + "T00:00:00").getDay();
            var frag = document.createDocumentFragment();
            for (var e = 0; e < pad; e++) { var blank = document.createElement("i"); blank.style.visibility = "hidden"; frag.appendChild(blank); }
            days.forEach(function (d) {
                var cell = document.createElement("i");
                cell.className = "l" + d.level;
                cell.title = d.date + ": " + d.count + (d.count === 1 ? " contribution" : " contributions");
                frag.appendChild(cell);
            });
            ghHeat.appendChild(frag);
            ghHeat.classList.add("ready");
        }).catch(function () {});
    }

    /* ---------- constellation field ---------- */
    var canvas = document.getElementById("field");
    if (!canvas || reduce) return;
    var ctx = canvas.getContext("2d");
    var W, H, pts = [], DPR = Math.min(window.devicePixelRatio || 1, 2);
    var N = function () { return Math.min(90, Math.floor((W * H) / 16000)); };
    var resize = function () {
        W = window.innerWidth; H = window.innerHeight;
        canvas.width = W * DPR; canvas.height = H * DPR;
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        var n = N();
        while (pts.length < n) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25, r: 1 + Math.random() * 1.4 });
        pts.length = n;
    };
    window.addEventListener("resize", resize);
    resize();
    var nodeRGB = function () { return getComputedStyle(root).getPropertyValue("--node").trim() || "255,255,255"; };
    var rgb = nodeRGB();
    new MutationObserver(function () { rgb = nodeRGB(); }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    var hidden = false;
    document.addEventListener("visibilitychange", function () { hidden = document.hidden; });
    (function draw() {
        requestAnimationFrame(draw);
        if (hidden) return;
        ctx.clearRect(0, 0, W, H);
        for (var a = 0; a < pts.length; a++) {
            var p = pts[a];
            var dx = mx - p.x, dy = my - p.y, d2 = dx * dx + dy * dy;
            if (d2 < 40000) { p.vx += dx / d2 * 2; p.vy += dy / d2 * 2; }
            p.vx *= 0.995; p.vy *= 0.995;
            p.x += p.vx; p.y += p.vy;
            if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
            if (p.y < -10) p.y = H + 10; if (p.y > H + 10) p.y = -10;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, 6.283);
            ctx.fillStyle = "rgba(" + rgb + ",0.5)";
            ctx.fill();
            for (var b = a + 1; b < pts.length; b++) {
                var q = pts[b], ex = p.x - q.x, ey = p.y - q.y, e2 = ex * ex + ey * ey;
                if (e2 < 14400) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
                    ctx.strokeStyle = "rgba(" + rgb + "," + (0.12 * (1 - e2 / 14400)).toFixed(3) + ")";
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
        /* amber thread to the cursor */
        for (var c = 0; c < pts.length; c++) {
            var s = pts[c], fx = mx - s.x, fy = my - s.y, f2 = fx * fx + fy * fy;
            if (f2 < 32400) {
                ctx.beginPath();
                ctx.moveTo(s.x, s.y); ctx.lineTo(mx, my);
                ctx.strokeStyle = "rgba(247,147,26," + (0.35 * (1 - f2 / 32400)).toFixed(3) + ")";
                ctx.stroke();
            }
        }
    })();
})();
