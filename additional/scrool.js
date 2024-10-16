let pagesToLoad = ['training', 'about', 'calculate']; // Pages to load progressively

// Function to fetch and load page content dynamically
async function loadPageContent(page) {
    const response = await fetch(`/${page}`); // Assuming the server handles these routes
    const content = await response.text();    // Fetch the HTML content as text
    const contentDiv = document.getElementById('content');  // The main content area
    const newSection = document.createElement('div');       // Create a new section
    newSection.innerHTML = content;                        // Set the fetched content
    contentDiv.appendChild(newSection);                    // Append it to the content area
}

// Function to detect scroll and load the next section
window.addEventListener('scroll', () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        if (pagesToLoad.length > 0) {
            const nextPage = pagesToLoad.shift(); // Get the next page from the array
            loadPageContent(nextPage);           // Load the page content
        }
    }
});