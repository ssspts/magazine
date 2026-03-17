const API_KEY = "pub_43d82f7874b149b5831109b9c8bb6eaa";
let pages = [];
let currentIndex = 0;
let nextPageToken = null;
let loadingNext = false;

// Detect mobile
function isMobile() { return window.innerWidth <= 768; }

// Load news
async function loadNews(nextToken = null){
    if(loadingNext) return;
    loadingNext = true;

    try {
        let url = `https://newsdata.io/api/1/news?apikey=${API_KEY}&q=movies`;
        if(nextToken) url += `&page=${nextToken}`;

        const res = await fetch(url);
        const data = await res.json();

        if(!data.results || data.results.length === 0){
            if(pages.length === 0) pages = ["<p>No articles found.</p>"];
            loadingNext = false;
            render();
            return;
        }

        // Map articles to HTML pages
        const newPages = data.results.map(item => `
            <h3>${item.title}</h3>
            ${item.image_url ? `<img src="${item.image_url}" class="news-img">` : ""}
            <p>${item.description ? item.description.substring(0,150)+'...' : ''}</p>
            <p style="font-size:12px;color:#666;">${item.pubDate ? new Date(item.pubDate).toLocaleString() : ''}</p>
            <a href="${item.link}" target="_blank">Read more</a>
        `);

        pages = pages.concat(newPages);
        nextPageToken = data.nextPage || null; // save token for next fetch
        render();
    } catch(err){
        console.error("Error fetching news:", err);
        if(pages.length === 0) pages = ["<p>Error fetching articles.</p>"];
        render();
    } finally {
        loadingNext = false;
    }
}

// Render pages
function render(){
    if(isMobile()){
        renderMobile();
        return;
    }

    const leftPage = document.getElementById("leftPage");
    const rightPage = document.getElementById("rightPage");

    leftPage.innerHTML = (pages[currentIndex] || "") + `<div class="page-number">${currentIndex+1}</div>`;
    rightPage.innerHTML = (pages[currentIndex+1] || "") + `<div class="page-number">${currentIndex+2}</div>`;
}

// Mobile render
function renderMobile(){
    const currentPageEl = document.getElementById("currentPage");
    currentPageEl.innerHTML = (pages[currentIndex] || "") + `<div class="page-number">${currentIndex+1}</div>`;
}

// Next page
function next(){
    if(isMobile()){
        if(currentIndex + 1 < pages.length) currentIndex++;
        renderMobile();
        // load more if nearing end
        if(currentIndex + 1 >= pages.length && nextPageToken) loadNews(nextPageToken);
        return;
    }

    const rightPage = document.getElementById("rightPage");
    rightPage.style.zIndex = 3;
    rightPage.classList.add("flip");

    setTimeout(()=>{
        currentIndex += 2;
        if(currentIndex + 2 >= pages.length && nextPageToken) loadNews(nextPageToken);
        render();
        rightPage.classList.remove("flip");
        rightPage.style.zIndex = 2;
    },400);
}

// Previous page
function prev(){
    if(isMobile()){
        if(currentIndex -1 >=0) currentIndex--;
        renderMobile();
        return;
    }

    const rightPage = document.getElementById("leftPage");
    rightPage.style.zIndex = 3;
    rightPage.classList.add("flip");

    setTimeout(()=>{
        if(currentIndex-2>=0) currentIndex -=2;
        render();
        rightPage.classList.remove("flip");
        rightPage.style.zIndex = 2;
    },400);
}

// Arrow keys
document.addEventListener("keydown", function(event) {
    if(event.key === "ArrowRight") next();
    else if(event.key === "ArrowLeft") prev();
});

// Mobile swipe
const container = document.getElementById("magazineContainer");
let startX = 0;
container.addEventListener('touchstart', e=>{ startX = e.touches[0].clientX; });
container.addEventListener('touchend', e=>{
    let endX = e.changedTouches[0].clientX;
    let diff = endX - startX;
    if(diff>50) prev();
    else if(diff<-50) next();
});

// Initial load
loadNews();