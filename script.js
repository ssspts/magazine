const API_KEY = "pub_43d82f7874b149b5831109b9c8bb6eaa";
let pages = [];
let currentIndex = 0;
let nextPageToken = null;
let loadingNext = false;

// Load news
async function loadNews(nextToken = null){
    if(loadingNext) return;
    loadingNext = true;

    try{
        let url = `https://newsdata.io/api/1/news?apikey=${API_KEY}&q=movies`;
        if(nextToken) url += `&page=${nextToken}`;

        const res = await fetch(url);
        const data = await res.json();

        if(!data.results || data.results.length === 0){
            if(pages.length === 0) pages = ["<p>No articles found.</p>"];
            loadingNext = false;
            return;
        }

        // Map articles to pages
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

// Render 2 pages
// Update the render function
function render(){
    // Left page content
    document.getElementById("leftPage").innerHTML = (pages[currentIndex] || "") +
        `<div class="page-number">${currentIndex + 1}</div>`;

    // Right page content
    document.getElementById("rightPage").innerHTML = (pages[currentIndex+1] || "") +
        `<div class="page-number">${currentIndex + 2}</div>`;
}
// Next / Prev buttons
function next(){
    const rightPage = document.getElementById("rightPage");
    rightPage.classList.add("flip");  // start flip animation

    setTimeout(() => {
        currentIndex += 2;
        if(currentIndex + 2 >= pages.length && nextPageToken){
            loadNews(nextPageToken);
        }
        render(); // update content
        rightPage.classList.remove("flip"); // reset for next flip
    }, 400);
}

function prev(){
    const rightPage = document.getElementById("leftPage");
    rightPage.classList.add("flip");

    setTimeout(() => {
        if(currentIndex - 2 >= 0){
            currentIndex -= 2;
            render();
        }
        rightPage.classList.remove("flip");
    }, 400);
}
document.addEventListener("keydown", function(event) {
    if(event.key === "ArrowRight") {
        next();  // move to next 2-page spread
    } else if(event.key === "ArrowLeft") {
        prev();  // move to previous 2-page spread
    }
});
// Initial load
loadNews();