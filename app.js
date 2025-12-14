// app.js (module)

// -----------------------------
// Firebase imports (CDN v9)
// -----------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  addDoc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// -----------------------------
// Your Firebase Config
// -----------------------------
const firebaseConfig = {
  apiKey: "AIzaSyDHCKiu7ezBSlE_aIFhDyiWTYHQRz-gM1k",
  authDomain: "maskan-8592c.firebaseapp.com",
  projectId: "maskan-8592c",
  storageBucket: "maskan-8592c.firebasestorage.app",
  messagingSenderId: "262615187618",
  appId: "1:262615187618:web:0e719234a43421f6d057fb",
  measurementId: "G-6SVX5LVP6B"
};

// -----------------------------
// Init
// -----------------------------
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// -----------------------------
// UI refs
// -----------------------------
const tabs = {
  sources: document.getElementById("tab-sources"),
  files: document.getElementById("tab-files"),
  playlists: document.getElementById("tab-playlists"),
  more: document.getElementById("tab-more")
};
const bottomBtns = Array.from(document.querySelectorAll(".bn-item"));

const inputUrl = document.getElementById("inputUrl");
const downloadBtn = document.getElementById("downloadBtn");
const pasteBtn = document.getElementById("pasteBtn");
const loadingEl = document.getElementById("loading");
const containerEl = document.getElementById("container");
const errorEl = document.getElementById("error");

const thumbEl = document.getElementById("thumb");
const titleEl = document.getElementById("title");
const descEl = document.getElementById("description");
const uploaderEl = document.getElementById("uploader");
const durationEl = document.getElementById("duration");
const extractorEl = document.getElementById("extractor");
const downloadURLEl = document.getElementById("downloadURL");
const downloadWrap = document.getElementById("download");

const ytBtn = document.getElementById("ytBtn");
const trendBtn = document.getElementById("trendBtn");

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const loginBtn2 = document.getElementById("loginBtn2");
const logoutBtn2 = document.getElementById("logoutBtn2");

const userNameEl = document.getElementById("userName");
const userEmailEl = document.getElementById("userEmail");
const userPhotoEl = document.getElementById("userPhoto");
const userStatusEl = document.getElementById("userStatus");

const historyList = document.getElementById("historyList");
const foldersList = document.getElementById("foldersList");
const playlistsList = document.getElementById("playlistsList");
const playlistEmpty = document.getElementById("playlistEmpty");

const autoPasteToggle = document.getElementById("autoPasteToggle");
const langBtn = document.getElementById("langBtn");

const helpBtn = document.getElementById("helpBtn");
const shareBtn = document.getElementById("shareBtn");
const shareAppBtn = document.getElementById("shareAppBtn");

// -----------------------------
// i18n (KU + EN)
// -----------------------------
const dict = {
  ku: {
    help: "یارمەتی",
    share: "هاوبەشکردن",
    bannerTitle: "ڕەنگین",
    bannerSub: "داونلۆدی ڤیدیۆ و دەنگ، خێرا و جوان",
    loginGoogle: "چوونەژوورەوە بە گووگڵ",
    logout: "دەرچوون",
    trending: "ترێندینگ",
    loading: "تکایە چاوەڕێ بکە...",
    historyHint: "هەر داونلۆدێک دەچێتە هیستۆری تۆ (Firebase)",
    sources: "Sources",
    files: "Files",
    playlists: "Playlists",
    more: "More",
    createFolder: "دروستکردنی فولدەر",
    folders: "Folders",
    history: "Download History",
    createPlaylist: "دروستکردنی Playlist",
    noPlaylists: "هیچ Playlist ـێک نیە",
    myPlaylists: "Playlist ـەکانم",
    subscription: "SUBSCRIPTION",
    removeAds: "Subscribe and Remove Ads",
    restore: "Restore Purchase",
    general: "GENERAL",
    support: "Technical Support",
    rate: "Rate App",
    shareApp: "Share App",
    ourApps: "Our Apps",
    settings: "SETTINGS",
    changeLang: "گۆڕینی زمان / تغيير اللغة",
    autoPaste: "Auto Paste Links",
    lockApp: "Lock Application",
    clearCache: "Clear Browser Cache & Cookies",
    clearCacheNote: "فایلە سەیوکراوەکانت ناگۆڕدرێن"
  },
  en: {
    help: "Help",
    share: "Share",
    bannerTitle: "Rangin",
    bannerSub: "Fast & beautiful video/audio downloader",
    loginGoogle: "Login with Google",
    logout: "Logout",
    trending: "Trending",
    loading: "Please wait...",
    historyHint: "Every download is saved to your history (Firebase)",
    sources: "Sources",
    files: "Files",
    playlists: "Playlists",
    more: "More",
    createFolder: "Create Folder",
    folders: "Folders",
    history: "Download History",
    createPlaylist: "Create Playlist",
    noPlaylists: "No Playlists",
    myPlaylists: "My Playlists",
    subscription: "SUBSCRIPTION",
    removeAds: "Subscribe and Remove Ads",
    restore: "Restore Purchase",
    general: "GENERAL",
    support: "Technical Support",
    rate: "Rate App",
    shareApp: "Share App",
    ourApps: "Our Apps",
    settings: "SETTINGS",
    changeLang: "Change Language / تغيير اللغة",
    autoPaste: "Auto Paste Links",
    lockApp: "Lock Application",
    clearCache: "Clear Browser Cache & Cookies",
    clearCacheNote: "It won’t affect your saved files"
  }
};

function getLang(){
  return localStorage.getItem("rangin_lang") || "ku";
}
function setLang(lang){
  localStorage.setItem("rangin_lang", lang);
  applyLang();
}
function applyLang(){
  const lang = getLang();
  const isKu = lang === "ku";
  document.documentElement.lang = isKu ? "ku" : "en";
  document.documentElement.dir = isKu ? "rtl" : "ltr";

  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const key = el.getAttribute("data-i18n");
    const val = dict[lang]?.[key];
    if (val) el.textContent = val;
  });

  // Placeholder depends on language
  inputUrl.placeholder = isKu ? "لینک بنووسە یان Search بکە..." : "Search YouTube or type a URL";
}
applyLang();

langBtn.addEventListener("click", ()=>{
  const next = getLang() === "ku" ? "en" : "ku";
  setLang(next);
});

// -----------------------------
// Tab switching
// -----------------------------
function openTab(name){
  Object.keys(tabs).forEach(k=>{
    tabs[k].classList.toggle("tab-active", k===name);
  });
  bottomBtns.forEach(b=>{
    b.classList.toggle("active", b.dataset.tab===name);
  });
}
bottomBtns.forEach(btn=>{
  btn.addEventListener("click", ()=> openTab(btn.dataset.tab));
});

// -----------------------------
// Helpers
// -----------------------------
function show(el){ el.classList.remove("hidden"); }
function hide(el){ el.classList.add("hidden"); }

function showError(msg){
  errorEl.innerHTML = escapeHtml(msg);
  show(errorEl);
  clearTimeout(window.__errTO);
  window.__errTO = setTimeout(()=> hide(errorEl), 6000);
}
function clearError(){ hide(errorEl); errorEl.innerHTML=""; }

function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function debounce(fn, wait=300){
  let t;
  return (...args)=>{
    clearTimeout(t);
    t=setTimeout(()=>fn(...args), wait);
  };
}

// Shorts + normal + youtu.be
function getYouTubeVideoId(url){
  try{
    const u = new URL(url);
    const hostOk = ["www.youtube.com","youtube.com","youtu.be"].includes(u.hostname);
    if(!hostOk) return null;
    if(u.hostname==="youtu.be"){
      const id = u.pathname.slice(1);
      return id?.length===11 ? id : null;
    }
    if(u.pathname.startsWith("/shorts/")){
      const id = u.pathname.split("/")[2];
      return id || null;
    }
    const id = u.searchParams.get("v");
    return (id && id.length===11) ? id : null;
  }catch{ return null; }
}

function getParameterByName(name, url) {
  name = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(url);
  if (!results) return '';
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// format colors
const formatColors = {
  greenFormats: ["17", "18", "22"],
  blueFormats: ["139", "140", "141", "249", "250", "251", "599", "600"],
  defaultColor: "#2f80ff"
};
function getBackgroundColor(itag){
  if (formatColors.greenFormats.includes(itag)) return "#30d158";
  if (formatColors.blueFormats.includes(itag)) return "#2f80ff";
  return formatColors.defaultColor;
}

// -----------------------------
// Clipboard paste
// -----------------------------
pasteBtn.addEventListener("click", async ()=>{
  try{
    const txt = await navigator.clipboard.readText();
    if (txt) inputUrl.value = txt.trim();
  }catch{
    showError(getLang()==="ku" ? "Clipboard ناتوانرێت بخوێندرێتەوە." : "Clipboard read failed.");
  }
});

// Auto paste
async function maybeAutoPaste(){
  if(!autoPasteToggle.checked) return;
  try{
    const txt = await navigator.clipboard.readText();
    if(txt && txt.includes("http")) inputUrl.value = txt.trim();
  }catch{}
}

// Quick fill list items
document.querySelectorAll(".listItem[data-fill]").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    inputUrl.value = btn.dataset.fill;
    openTab("sources");
  });
});

ytBtn.addEventListener("click", ()=>{
  inputUrl.value = "https://www.youtube.com/";
});
trendBtn.addEventListener("click", ()=>{
  inputUrl.value = "https://www.youtube.com/feed/trending";
});

// -----------------------------
// Share buttons
// -----------------------------
async function doShare(text){
  try{
    if(navigator.share){
      await navigator.share({ title:"ڕەنگین | Rangin", text, url: location.href });
    }else{
      await navigator.clipboard.writeText(text + " " + location.href);
      showError(getLang()==="ku" ? "کۆپی کرا ✅" : "Copied ✅");
    }
  }catch{}
}
shareBtn.addEventListener("click", ()=> doShare("Rangin"));
shareAppBtn.addEventListener("click", ()=> doShare("Rangin"));

helpBtn.addEventListener("click", ()=>{
  const msg = getLang()==="ku"
    ? "١) لینک بنووسە\n٢) داونلۆد کلیک بکە\n٣) کوالیتی هەڵبژێرە\n\nGoogle Login بۆ سەیوکردنی هیستۆری."
    : "1) Paste a link\n2) Tap Go\n3) Choose a quality\n\nLogin with Google to save your history.";
  alert(msg);
});

// -----------------------------
// Firebase Auth UI
// -----------------------------
loginBtn.addEventListener("click", loginGoogle);
loginBtn2.addEventListener("click", loginGoogle);
logoutBtn.addEventListener("click", logout);
logoutBtn2.addEventListener("click", logout);

async function loginGoogle(){
  try{
    await signInWithPopup(auth, provider);
  }catch(e){
    showError(e?.message || "Login failed");
  }
}

async function logout(){
  try{ await signOut(auth); }catch(e){
    showError(e?.message || "Logout failed");
  }
}

// -----------------------------
// Firestore paths
// users/{uid}
// users/{uid}/history/{doc}
// users/{uid}/folders/{doc}
// users/{uid}/playlists/{doc}
// -----------------------------
let currentUser = null;
let unsubHistory = null;
let unsubFolders = null;
let unsubPlaylists = null;

onAuthStateChanged(auth, async (user)=>{
  currentUser = user || null;

  // UI
  if(user){
    userStatusEl.textContent = "Logged";
    userNameEl.textContent = user.displayName || "User";
    userEmailEl.textContent = user.email || "—";
    userPhotoEl.src = user.photoURL || "./logo.png";
    hide(loginBtn); show(logoutBtn);
    hide(loginBtn2); show(logoutBtn2);

    // save profile doc
    await setDoc(doc(db, "users", user.uid), {
      email: user.email || null,
      name: user.displayName || null,
      photoURL: user.photoURL || null,
      lang: getLang(),
      updatedAt: serverTimestamp()
    }, { merge:true });

    // start listeners
    startUserListeners(user.uid);
  }else{
    userStatusEl.textContent = "Guest";
    userNameEl.textContent = "—";
    userEmailEl.textContent = "—";
    userPhotoEl.src = "./logo.png";
    show(loginBtn); hide(logoutBtn);
    show(loginBtn2); hide(logoutBtn2);

    stopUserListeners();
    renderGuestLists();
  }

  // try auto paste on load or after login
  maybeAutoPaste();
});

function stopUserListeners(){
  if(unsubHistory) unsubHistory();
  if(unsubFolders) unsubFolders();
  if(unsubPlaylists) unsubPlaylists();
  unsubHistory = unsubFolders = unsubPlaylists = null;
}

function renderGuestLists(){
  historyList.innerHTML = `<div class="listItem"><span class="ic">i</span><span>${getLang()==="ku"?"تکایە بە گووگڵ بچۆ ژوورەوە بۆ بینینی هیستۆری.":"Login with Google to see your history."}</span></div>`;
  foldersList.innerHTML = `<div class="listItem"><span class="ic">i</span><span>${getLang()==="ku"?"Guest ـە، فولدەر نیە.":"Guest mode, no folders."}</span></div>`;
  playlistsList.innerHTML = "";
  playlistEmpty.classList.remove("hidden");
}

function startUserListeners(uid){
  stopUserListeners();

  // History
  const hq = query(collection(db, "users", uid, "history"), orderBy("createdAt","desc"), limit(30));
  unsubHistory = onSnapshot(hq, (snap)=>{
    if(snap.empty){
      historyList.innerHTML = `<div class="listItem"><span class="ic">⭘</span><span>${getLang()==="ku"?"هیستۆری نیە":"No history yet"}</span></div>`;
      return;
    }
    historyList.innerHTML = "";
    snap.forEach(d=>{
      const it = d.data();
      const title = it.title || it.url || "Item";
      const time = it.createdAt?.toDate ? it.createdAt.toDate().toLocaleString() : "";
      historyList.innerHTML += `
        <button class="listItem" data-hurl="${escapeHtml(it.url||"")}">
          <span class="ic">⬇︎</span>
          <span>
            <div style="font-weight:1000">${escapeHtml(title).slice(0,60)}</div>
            <div class="small">${escapeHtml(time)}</div>
          </span>
          <span class="chev">›</span>
        </button>
      `;
    });

    // click = fill url
    historyList.querySelectorAll(".listItem[data-hurl]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        inputUrl.value = btn.dataset.hurl;
        openTab("sources");
      });
    });
  });

  // Folders (simple)
  const fq = query(collection(db, "users", uid, "folders"), orderBy("createdAt","desc"), limit(30));
  unsubFolders = onSnapshot(fq, (snap)=>{
    foldersList.innerHTML = "";
    if(snap.empty){
      foldersList.innerHTML = `<div class="listItem"><span class="ic">📁</span><span>${getLang()==="ku"?"هیچ فولدەرێک نیە":"No folders"}</span></div>`;
      return;
    }
    snap.forEach(d=>{
      const it = d.data();
      foldersList.innerHTML += `
        <div class="listItem">
          <span class="ic">📁</span>
          <span>${escapeHtml(it.name || "Folder")}</span>
          <span class="chev">${escapeHtml(it.count || 0)}</span>
        </div>
      `;
    });
  });

  // Playlists
  const pq = query(collection(db, "users", uid, "playlists"), orderBy("createdAt","desc"), limit(30));
  unsubPlaylists = onSnapshot(pq, (snap)=>{
    playlistsList.innerHTML = "";
    if(snap.empty){
      playlistEmpty.classList.remove("hidden");
      return;
    }
    playlistEmpty.classList.add("hidden");
    snap.forEach(d=>{
      const it = d.data();
      playlistsList.innerHTML += `
        <div class="listItem">
          <span class="ic">▶︎</span>
          <span>${escapeHtml(it.name || "Playlist")}</span>
          <span class="chev">${escapeHtml(it.items || 0)}</span>
        </div>
      `;
    });
  });
}

// Create folder / playlist
document.getElementById("createFolderBtn").addEventListener("click", async ()=>{
  if(!currentUser) return showError(getLang()==="ku"?"سەرەتا بە گووگڵ بچۆ ژوورەوە.":"Please login first.");
  const name = prompt(getLang()==="ku"?"ناوی فولدەر؟":"Folder name?");
  if(!name) return;
  await addDoc(collection(db,"users",currentUser.uid,"folders"),{
    name: name.trim(),
    count: 0,
    createdAt: serverTimestamp()
  });
});

document.getElementById("createPlaylistBtn").addEventListener("click", async ()=>{
  if(!currentUser) return showError(getLang()==="ku"?"سەرەتا بە گووگڵ بچۆ ژوورەوە.":"Please login first.");
  const name = prompt(getLang()==="ku"?"ناوی Playlist؟":"Playlist name?");
  if(!name) return;
  await addDoc(collection(db,"users",currentUser.uid,"playlists"),{
    name: name.trim(),
    items: 0,
    createdAt: serverTimestamp()
  });
});

// -----------------------------
// Download request (your API)
// -----------------------------
downloadBtn.addEventListener("click", debounce(async ()=>{
  clearError();
  hide(containerEl);
  show(loadingEl);
  downloadBtn.disabled = true;

  const url = inputUrl.value.trim();
  if(!url){
    hide(loadingEl);
    downloadBtn.disabled = false;
    return showError(getLang()==="ku"?"تکایە لینکێکی دروست بنووسە.":"Please enter a valid URL.");
  }

  try{
    const data = await makeRequest(url);
    handleSuccess(data, url);
  }catch(e){
    showError(getLang()==="ku"
      ? "نەتوانرا لینکەکان وەرگیرێن. دووبارە هەوڵبدە."
      : "Failed to fetch links. Please try again.");
  }finally{
    hide(loadingEl);
    downloadBtn.disabled = false;
  }
}, 250));

async function makeRequest(inputUrl, retries=1){
  const requestUrl = `https://vkrdownloader.org/server?api_key=vkrdownloader&vkr=${encodeURIComponent(inputUrl)}`;
  const timeoutMs = 15000;

  for(let attempt=0; attempt<=retries; attempt++){
    try{
      const controller = new AbortController();
      const t = setTimeout(()=>controller.abort(), timeoutMs);
      const res = await fetch(requestUrl, { signal: controller.signal });
      clearTimeout(t);
      if(!res.ok) throw new Error("HTTP "+res.status);
      return await res.json();
    }catch(e){
      if(attempt === retries) throw e;
      await new Promise(r=>setTimeout(r, 1800 * (attempt+1)));
    }
  }
}

function sanitizeContent(content){
  // Simple sanitize (you used DOMPurify before; here we escape to keep safe)
  return escapeHtml(content);
}

function handleSuccess(data, inputUrlRaw){
  if(!data?.data){
    hide(containerEl);
    return showError(getLang()==="ku"
      ? "کێشە هەیە: نەتوانرا لینک بدۆزرێتەوە."
      : "Issue: unable to retrieve links.");
  }

  const videoData = data.data;
  show(containerEl);

  // Thumbnail / video preview
  const source = videoData.source || inputUrlRaw;
  const videoId = getYouTubeVideoId(source);
  const thumbnailUrl = videoId
    ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    : (videoData.thumbnail || "");

  const downloads = Array.isArray(videoData.downloads) ? videoData.downloads : [];
  const sampleUrl = downloads[0]?.url || "";

  const previewHtml = `
    <video style="background:#000 url('${thumbnailUrl}') center/cover no-repeat; width:100%; height:260px; border-radius:14px;"
      poster="${thumbnailUrl}" controls playsinline>
      <source src="${sampleUrl}" type="video/mp4">
    </video>
  `;
  thumbEl.innerHTML = previewHtml;

  // Title/desc/meta
  titleEl.innerHTML = videoData.title ? `<div>${sanitizeContent(videoData.title)}</div>` : "";
  uploaderEl.innerHTML = videoData.uploader ? `👤 ${sanitizeContent(videoData.uploader)}` : "";
  durationEl.innerHTML = videoData.size ? `📦 ${sanitizeContent(videoData.size)}` : "";
  extractorEl.innerHTML = videoData.extractor ? `⚙️ ${sanitizeContent(videoData.extractor)}` : "";
  descEl.innerHTML = videoData.description
    ? `<details><summary>${getLang()==="ku"?"پیشاندانی وەسف":"View description"}</summary><div style="margin-top:8px">${sanitizeContent(videoData.description)}</div></details>`
    : "";
  downloadURLEl.innerHTML = sanitizeContent(source);

  // Buttons
  generateDownloadButtons(videoData, inputUrlRaw);

  // Save history to Firestore (per user)
  saveHistory(videoData, inputUrlRaw, thumbnailUrl);
}

function generateDownloadButtons(videoData, inputUrlRaw){
  downloadWrap.innerHTML = "";
  const downloads = Array.isArray(videoData.downloads) ? videoData.downloads : [];

  downloads.forEach(d=>{
    if(!d?.url) return;
    const itag = getParameterByName("itag", d.url);
    const bg = getBackgroundColor(itag);
    const ext = d.format_id || "format";
    const size = d.size || "";
    const title = videoData.title || "video";

    // safer encode
    const redirectUrl =
      `https://vkrdownloader.org/forcedl?forceT=${encodeURIComponent(title)}&forceD=${encodeURIComponent(d.url)}`;

    const btn = document.createElement("button");
    btn.className = "dlbtns";
    btn.style.background = bg;
    btn.textContent = `${ext} - ${size}`;
    btn.addEventListener("click", ()=>{
      window.location.href = redirectUrl;
      // also save as "file" entry
      saveFile(videoData, d, inputUrlRaw);
    });
    downloadWrap.appendChild(btn);
  });

  if(downloadWrap.innerHTML.trim()===""){
    showError(getLang()==="ku"
      ? "Server Down / Too Many Requests 😅"
      : "Server Down / Too Many Requests 😅");
    hide(containerEl);
  }
}

// -----------------------------
// Firestore: save history + files
// -----------------------------
async function saveHistory(videoData, url, thumb){
  if(!currentUser) return; // Guest: no saving
  try{
    await addDoc(collection(db, "users", currentUser.uid, "history"), {
      url,
      title: videoData.title || null,
      source: videoData.source || null,
      thumbnail: thumb || videoData.thumbnail || null,
      extractor: videoData.extractor || null,
      createdAt: serverTimestamp()
    });
  }catch{}
}

async function saveFile(videoData, downloadObj, url){
  if(!currentUser) return;
  try{
    await addDoc(collection(db, "users", currentUser.uid, "files"), {
      url,
      title: videoData.title || null,
      format_id: downloadObj.format_id || null,
      size: downloadObj.size || null,
      directUrl: downloadObj.url || null,
      createdAt: serverTimestamp()
    });
  }catch{}
}