const API_KEY = "pub_43d82f7874b149b5831109b9c8bb6eaa"; // replace with your key
let pages = [];
let currentIndex = 0;
let nextPageToken = null;
let loadingNext = false;

// Detect mobile
function isMobile() {
    return window.innerWidth <= 768;
}

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

        const newPages = data.results.map(item => `
            <h3>${item.title}</h3>
            ${item.image_url ? `<img src="${item.image_url}" class="news-img">` : ""}
            <p>${item.description ? item.description.substring(0,150)+'...' : ''}</p>
            <p style="font-size:12px;color:#666;">${item.pubDate ? new Date(item.pubDate).toLocaleString() : ''}</p>
            <a href="${item.link}" target="_blank">Read more</a>
        `);

        pages = pages.concat(newPages);
        nextPageToken = data.nextPage || null;
        render();
    } catch(err) {
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
        // Show mobile page
        const mobilePage = document.getElementById("currentPage");
        mobilePage.innerHTML = (pages[currentIndex] || "<p>No articles yet.</p>") +
            `<div class="page-number">${currentIndex+1}</div>`;
        return;
    }

    // Desktop 2-page spread
    const leftPage = document.getElementById("leftPage");
    const rightPage = document.getElementById("rightPage");

    leftPage.innerHTML = (pages[currentIndex] || "<p>No articles yet.</p>") +
        `<div class="page-number">${currentIndex+1}</div>`;
    rightPage.innerHTML = (pages[currentIndex+1] || "<p>No articles yet.</p>") +
        `<div class="page-number">${currentIndex+2}</div>`;
}

// Next page
function next(){
    if(isMobile()){
        if(currentIndex + 1 < pages.length) currentIndex++;
        render();
        if(currentIndex + 1 >= pages.length && nextPageToken) loadNews(nextPageToken);
        return;
    }

    const rightPage = document.getElementById("rightPage");
    rightPage.classList.add("flip");

    setTimeout(()=>{
        currentIndex += 2;
        if(currentIndex + 2 >= pages.length && nextPageToken) loadNews(nextPageToken);
        render();
        rightPage.classList.remove("flip");
    }, 400);
}

// Previous page
function prev(){
    if(isMobile()){
        if(currentIndex -1 >=0) currentIndex--;
        render();
        return;
    }

    const rightPage = document.getElementById("leftPage");
    rightPage.classList.add("flip");

    setTimeout(()=>{
        if(currentIndex-2>=0) currentIndex -=2;
        render();
        rightPage.classList.remove("flip");
    }, 400);
}

// Arrow keys
document.addEventListener("keydown", function(event){
    if(event.key==="ArrowRight") next();
    else if(event.key==="ArrowLeft") prev();
});

// Mobile swipe support
const container = document.getElementById("magazineContainer");
let startX = 0;
container.addEventListener('touchstart', e=>{ startX = e.touches[0].clientX; });
container.addEventListener('touchend', e=>{
    let endX = e.changedTouches[0].clientX;
    let diff = endX - startX;
    if(diff>50) prev();
    else if(diff<-50) next();
});

// Re-render on window resize (mobile <-> desktop)
window.addEventListener("resize", render);

// Initial load
loadNews();