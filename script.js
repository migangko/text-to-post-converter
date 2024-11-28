// Initialize user ID
const userId = localStorage.getItem('userId') || `user_${Math.random().toString(36).substr(2, 9)}`;
localStorage.setItem('userId', userId);

// Elements
const elements = {
    headlineInput: document.getElementById('headlineInput'),
    summaryInput: document.getElementById('summaryInput'),
    previewHeadline: document.getElementById('previewHeadline'),
    previewSummary: document.getElementById('previewSummary'),
    previewHashtags: document.getElementById('previewHashtags'),
    generateBtn: document.getElementById('generateBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    shareBtn: document.getElementById('shareBtn'),
    shareModal: document.getElementById('shareModal'),
    imageUpload: document.getElementById('imageUpload'),
    previewImage: document.getElementById('previewImage'),
    headlineFont: document.getElementById('headlineFont'),
    summaryFont: document.getElementById('summaryFont'),
    headlineColor: document.getElementById('headlineColor'),
    summaryColor: document.getElementById('summaryColor'),
};

// Live preview updates
elements.headlineInput.addEventListener('input', updatePreview);
elements.summaryInput.addEventListener('input', updatePreview);
elements.headlineFont.addEventListener('change', updateStyles);
elements.summaryFont.addEventListener('change', updateStyles);
elements.headlineColor.addEventListener('input', updateStyles);
elements.summaryColor.addEventListener('input', updateStyles);

function updatePreview() {
    elements.previewHeadline.textContent = elements.headlineInput.value;
    elements.previewSummary.textContent = elements.summaryInput.value;
    updateStyles();
}

function updateStyles() {
    elements.previewHeadline.className = `text-2xl mb-2 ${elements.headlineFont.value}`;
    elements.previewSummary.className = `${elements.summaryFont.value}`;
    elements.previewHeadline.style.color = elements.headlineColor.value;
    elements.previewSummary.style.color = elements.summaryColor.value;
}

// Image upload handling
elements.imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => elements.previewImage.src = e.target.result;
        reader.readAsDataURL(file);
    }
});

// Generate post
elements.generateBtn.addEventListener('click', async () => {
    const headline = elements.headlineInput.value;
    const summary = elements.summaryInput.value;

    if (!headline || !summary) {
        alert('Please enter both headline and summary!');
        return;
    }

    elements.generateBtn.innerHTML = '<span class="loader"></span>';
    elements.generateBtn.disabled = true;

    try {
        const response = await fetch('https://r0c8kgwocscg8gsokogwwsw4.zetaverse.one/ai', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer OBu8mNUDybQGnxSxQdqnsGY9IbR2',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [{
                    role: 'user',
                    content: [{
                        type: 'text',
                        text: `Generate 5 relevant hashtags for this news post:\nHeadline: ${headline}\nSummary: ${summary}`
                    }]
                }]
            })
        });

        const data = await response.json();
        elements.previewHashtags.textContent = data.message;

        // Store in database
        await fetch('https://r0c8kgwocscg8gsokogwwsw4.zetaverse.one/db', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer OBu8mNUDybQGnxSxQdqnsGY9IbR2',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId,
                appSlug: 'newstogram',
                action: 'create',
                table: 'posts',
                data: {
                    headline,
                    summary,
                    hashtags: data.message,
                    timestamp: new Date().toISOString()
                }
            })
        });

    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    } finally {
        elements.generateBtn.innerHTML = 'Generate Post';
        elements.generateBtn.disabled = false;
    }
});

// Download functionality
elements.downloadBtn.addEventListener('click', async () => {
    try {
        const canvas = await html2canvas(document.getElementById('preview-container'));
        const link = document.createElement('a');
        link.download = 'newstogram-post.png';
        link.href = canvas.toDataURL();
        link.click();
    } catch (error) {
        console.error('Download error:', error);
        alert('Error downloading the image. Please try again.');
    }
});