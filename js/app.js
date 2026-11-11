const $ = (id) => document.getElementById(id);

const sceneBook = $("sceneBook");
const sceneLetter = $("sceneLetter");
const book = $("book");
const letter = $("letter");
const topNote = $("topNote");
const dropHint = $("dropHint");
const endNote = $("endNote");

const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

// Make a div behave like a button (tap, Enter, Space)
function makeButton(el, fn) {
  el.addEventListener("click", fn);
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn();
    }
  });
}

// ── SAKURA PETALS ────────────────────────────────────────────
const petalBox = $("petals");
const petalColors = ["#f9c3d3", "#f4a3bd", "#ffd9e4", "#f7b6c8", "#ffe3ec"];

function spawnPetal() {
  if (reduceMotion) return;
  const el = document.createElement("span");
  const w = 9 + Math.random() * 10;
  const dur = 8 + Math.random() * 7;
  el.className = "petal";
  el.style.width = w + "px";
  el.style.height = w * 0.8 + "px";
  el.style.left = Math.random() * 100 + "vw";
  el.style.background =
    petalColors[Math.floor(Math.random() * petalColors.length)];
  el.style.animationDuration = dur + "s";
  el.style.setProperty("--dx", Math.random() * 160 - 40 + "px");
  el.style.setProperty("--rot", 180 + Math.random() * 360 + "deg");
  petalBox.appendChild(el);
  setTimeout(() => el.remove(), dur * 1000 + 200);
}
function petalBurst(n) {
  for (let i = 0; i < n; i++) setTimeout(spawnPetal, i * 90);
}

setInterval(spawnPetal, 1100); // gentle, constant drift
petalBurst(6);

// ── STEP 1: OPEN THE DIARY ───────────────────────────────────
let bookOpened = false;
let letterReady = false;

function openBook() {
  if (bookOpened) return;
  bookOpened = true;

  book.classList.add("open"); // cover swings open
  book.removeAttribute("tabindex");
  book.removeAttribute("role");
  topNote.classList.add("hide");

  // the letter slips out of the pages
  setTimeout(() => letter.classList.add("dropped"), 1500);

  // then becomes tappable + show the hint
  setTimeout(() => {
    letterReady = true;
    letter.classList.add("ready");
    dropHint.classList.add("show");
  }, 3000);
}
makeButton(book, openBook);

// ── STEP 2: OPEN THE LETTER ──────────────────────────────────
let letterOpened = false;

function openLetter() {
  if (!letterReady || letterOpened) return;
  letterOpened = true;

  sceneBook.classList.add("fade-out");
  petalBurst(10);

  setTimeout(() => {
    sceneBook.classList.add("hidden");
    sceneLetter.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 550);
}
makeButton(letter, openLetter);

// ── REPLY MODAL ──────────────────────────────────────────────
const modal = $("replyModal");

function openReplyModal() {
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
  setTimeout(() => $("replyMessage").focus(), 300);
}
function closeReplyModal() {
  modal.classList.remove("open");
  document.body.style.overflow = "";
}

$("btnReply").addEventListener("click", openReplyModal);
$("modalClose").addEventListener("click", closeReplyModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeReplyModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeReplyModal();
});

// ── SEND REPLY VIA EMAILJS ───────────────────────────────────
$("replyForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const text = $("replyMessage").value.trim();
  const btnSend = $("btnSend");
  const sendNote = $("sendNote");
  if (!text) return;

  btnSend.disabled = true;
  btnSend.textContent = "Sending… 💌";
  sendNote.textContent = "";
  sendNote.className = "send-note";

  emailjs
    .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      from_name: "Uno",
      message: "[PART 4 — her final answer]\n\n" + text,
      to_email: "crissstmads@gmail.com",
      reply_to: "noreply@confession.site",
    })
    .then(() => {
      closeReplyModal();
      $("replyForm").reset();
      btnSend.disabled = false;
      btnSend.textContent = "Send 💌";
      finale();
    })
    .catch((err) => {
      console.error("EmailJS error:", err);
      btnSend.disabled = false;
      btnSend.textContent = "Send 💌";
      sendNote.textContent = "Hmm, that didn't send. Try again? 🥺";
      sendNote.className = "send-note error";
    });
});

// ── FINALE: the book closes → "The End" ──────────────────────
let finished = false;

function finale() {
  if (finished) return;
  finished = true;

  // 1. the letter fades away
  sceneLetter.classList.add("leaving");

  setTimeout(() => {
    sceneLetter.classList.add("hidden");

    // 2. bring the (still open) diary back, without the letter
    letter.style.display = "none";
    sceneBook.classList.add("finale");
    sceneBook.classList.remove("hidden");
    void sceneBook.offsetWidth; // let the browser register the change
    sceneBook.classList.remove("fade-out");
    window.scrollTo({ top: 0 });

    // 3. the cover swings shut
    setTimeout(() => book.classList.remove("open"), 900);

    // 4. cover now reads "The End" + petals + thank-you line
    setTimeout(() => {
      book.classList.add("ended");
      endNote.classList.add("show");
      petalBurst(40);
    }, 2400);
  }, 750);
}
