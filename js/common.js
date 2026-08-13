/* ================================
共通パーツ読み込み
================================ */

async function loadPart(id, file) {
  const res = await fetch(file);
  const html = await res.text();
  document.getElementById(id).innerHTML = html;
}

async function loadCommon(){

  await loadPart("header","parts/header.html");
  await loadPart("nav","parts/nav.html");
  await loadPart("footer","parts/footer.html");

  applyPageHeader();
  buildTOC();
  initMode();
  syncFixedTopHeight();
}


/* ================================
ページタイトル差し込み
================================ */

function applyPageHeader(){

  const body = document.body;

  const titleEasy = body.dataset.titleEasy;
  const titleNormal = body.dataset.titleNormal;

  const leadEasy = body.dataset.leadEasy;
  const leadNormal = body.dataset.leadNormal;

  const title = document.getElementById("page-title");
  const lead  = document.getElementById("page-lead");

  if(title){
    title.innerHTML = `
      <span class="text-easy">${titleEasy}</span>
      <span class="text-normal">${titleNormal}</span>
    `;
  }

  if(lead){
    lead.innerHTML = `
      <span class="text-easy">${leadEasy}</span>
      <span class="text-normal">${leadNormal}</span>
    `;
  }

}


/* ================================
nav（目次）自動生成
================================ */

function buildTOC(){

  const toc = document.getElementById("toc");
  if(!toc) return;

  const sections = document.querySelectorAll("main section");

  sections.forEach(section => {

    const id = section.id;
    const h2 = section.querySelector("h2");

    if(!h2) return;

    const easy   = h2.querySelector(".text-easy")?.innerHTML || "";
    const normal = h2.querySelector(".text-normal")?.innerHTML || "";

    const li = document.createElement("li");

    li.innerHTML = `
      <span class="text-easy">
        <a href="#${id}">${easy}</a>
      </span>
      <span class="text-normal">
        <a href="#${id}">${normal}</a>
      </span>
    `;

    toc.appendChild(li);

  });

}


/* ================================
GIF 再生制御
================================ */

const gifStates = {};

function toggleGif(id, gifSrc, stillSrc, button){

  const img = document.getElementById(id);
  const isPlaying = gifStates[id];

  if(!img) return;

  if(!isPlaying){

    img.src = gifSrc;
    button.textContent = "止める";
    gifStates[id] = true;

  } else {

    img.src = stillSrc;
    button.textContent = "見る";
    gifStates[id] = false;

  }

}


/* ================================
表記モード（easy / normal）
================================ */

function initMode(){

  const MODE_KEY = "readingMode";
  const radios = document.querySelectorAll('input[name="mode"]');

  function readModeFromUrl(){
    const url = new URL(location.href);
    const m = url.searchParams.get("mode");
    return (m === "easy" || m === "normal") ? m : null;
  }

  function readModeFromStorage(){
    try{
      const m = localStorage.getItem(MODE_KEY);
      return (m === "easy" || m === "normal") ? m : null;
    }catch(e){
      return null;
    }
  }

  function applyMode(mode){

    document.body.classList.toggle("mode-normal", mode === "normal");
    document.body.classList.toggle("mode-easy", mode === "easy");

    radios.forEach(r => {
      r.checked = (r.value === mode);
    });

    /* 記事内リンクのmode引き継ぎ */

    document.querySelectorAll("a[data-basehref]").forEach(a => {

      const base = a.getAttribute("data-basehref");
      a.href = `${base}?mode=${mode}`;

    });

    /* URL更新 */

    const url = new URL(location.href);
    url.searchParams.set("mode", mode);
    history.replaceState(null,"",url);

    /* 保存 */

    try{
      localStorage.setItem(MODE_KEY, mode);
    }catch(e){}

  }

  const initialMode =
      readModeFromUrl()
   || readModeFromStorage()
   || "easy";

  applyMode(initialMode);

  radios.forEach(radio => {
    radio.addEventListener("change", () => {
      applyMode(radio.value);
    });
  });

}


/* ================================
固定ヘッダー高さ
================================ */

function syncFixedTopHeight(){

  const fixed = document.querySelector(".fixed-top");
  if(!fixed) return;

  document.documentElement
    .style
    .setProperty("--fixed-top-h", fixed.offsetHeight + "px");

}

window.addEventListener("resize", syncFixedTopHeight);


/* ================================
初期化
================================ */

document.addEventListener("DOMContentLoaded", loadCommon);