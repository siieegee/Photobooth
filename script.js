function gotoWelcomePage() {
    window.location.href = 'welcome.html';
}

function startPhotobooth() {
    window.location.href = 'photobooth.html';
}

function goHome() {
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
    // 📸 PHOTOBOOTH PAGE LOGIC
    if (window.location.pathname.includes('photobooth.html')) {
        const video = document.getElementById('video');
        const photosContainer = document.getElementById('photos');
        const startCountdownButton = document.getElementById('startCountdown');
        const countdownElement = document.getElementById('countdown');
        const countdownContainer = document.getElementById('countdown-container');
        let count = 0;
        let capturedImages = [];

        // Hide countdown initially
        countdownContainer.style.display = 'none';

        // Access user's webcam
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                video.srcObject = stream;
            })
            .catch(err => console.error("Error accessing camera:", err));

        function takePhoto() {
            countdownElement.style.display = 'block'; // Show countdown text
            countdownContainer.style.display = 'flex'; // Show countdown background
            let timer = 3;

            const countdownInterval = setInterval(() => {
                countdownElement.textContent = timer;

                if (timer === 0) {
                    clearInterval(countdownInterval);
                    countdownElement.style.display = 'none'; // Hide countdown text
                    countdownContainer.style.display = 'none'; // Hide countdown background

                    // Capture the photo
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.width = 500;
                    canvas.height = 500;

                    context.translate(canvas.width, 0);
                    context.scale(-1, 1);
                    
                    const cropSize = Math.min(video.videoWidth, video.videoHeight);
                    const sx = (video.videoWidth - cropSize) / 2;
                    const sy = (video.videoHeight - cropSize) / 2;
                    context.drawImage(video, sx, sy, cropSize, cropSize, 0, 0, canvas.width, canvas.height);
                    const imgData = canvas.toDataURL('image/png');
                    capturedImages.push(imgData);

                    // Display the captured image
                    const img = document.createElement('img');
                    img.src = imgData;
                    img.classList.add('photo');
                    photosContainer.appendChild(img);

                    count++;
                    if (count < 3) {
                        takePhoto();
                    } else {
                        localStorage.setItem('capturedImages', JSON.stringify(capturedImages));
                        localStorage.removeItem('photoCaption');
                        window.location.href = 'caption.html';
                    }
                }
                timer--;
            }, 1000);
        }

        // Start countdown and take photos when button is clicked
        startCountdownButton.addEventListener('click', () => {
            countdownContainer.style.display = 'flex'; // Show countdown container
            count = 0;
            capturedImages = [];
            photosContainer.innerHTML = '';
            takePhoto();
        });
    }

    // ✍️ CAPTION PAGE LOGIC
    if (window.location.pathname.includes('caption.html')) {
        const photosContainer = document.getElementById('photos');
        const savedImages = JSON.parse(localStorage.getItem('capturedImages')) || [];
        const submitButton = document.getElementById('submitCaption');
        const downloadButton = document.getElementById('downloadButton');

        if (savedImages.length === 0) {
            photosContainer.innerHTML = "<p>No photos available.</p>";
        } else {
            savedImages.forEach(imgSrc => {
                const img = document.createElement('img');
                img.src = imgSrc;
                img.classList.add('photo');
                photosContainer.appendChild(img);
            });
        }

        // Load saved caption if it exists
        const savedCaption = localStorage.getItem('photoCaption');
        if (savedCaption) {
            const captionElement = document.createElement("p");
            captionElement.id = "photo-caption";
            captionElement.textContent = savedCaption;
            photosContainer.appendChild(captionElement);
        }

        // Handle caption submission
        submitButton.addEventListener('click', () => {
            const captionText = document.getElementById('caption').value.trim();

            if (captionText !== "") {
                localStorage.setItem('photoCaption', captionText);

                let existingCaption = document.getElementById("photo-caption");
                if (existingCaption) {
                    existingCaption.remove();
                }

                const captionElement = document.createElement("p");
                captionElement.id = "photo-caption";
                captionElement.textContent = captionText;
                photosContainer.appendChild(captionElement);

                document.getElementById('caption').value = "";
                downloadButton.style.display = "block"; // Show download button
            }
        });

        // Redirect to download page when clicking "Download"
        downloadButton.addEventListener('click', () => {
            window.location.href = 'download.html';
        });
    }

    // 🖼️ DOWNLOAD PAGE LOGIC
    if (window.location.pathname.includes('download.html')) {
        const photosContainer = document.getElementById('photos');
        const savedImages = JSON.parse(localStorage.getItem('capturedImages')) || [];
        const savedCaption = localStorage.getItem('photoCaption');

        // Ensure the photos exist before displaying
        if (savedImages.length === 0) {
            photosContainer.innerHTML = "<p>No photos available.</p>";
        } else {
            savedImages.forEach(imgSrc => {
                const img = document.createElement('img');
                img.src = imgSrc;
                img.classList.add('photo');
                photosContainer.appendChild(img);
            });
        }

        // Ensure the caption is displayed properly
        if (savedCaption) {
            const captionElement = document.createElement("p");
            captionElement.id = "photo-caption";
            captionElement.textContent = savedCaption;
            captionElement.style.marginTop = "10px";
            captionElement.style.fontWeight = "bold";
            captionElement.style.textAlign = "center";
            photosContainer.appendChild(captionElement);
        }

        // Handle Downloading the Full Photos + Caption
        document.getElementById('downloadImage').addEventListener('click', () => {
            const photosContainerElement = document.getElementById('photosContainer');

            html2canvas(photosContainerElement).then(canvas => {
                const link = document.createElement('a');
                link.href = canvas.toDataURL("image/png");
                link.download = "photo_collage.png";
                link.click();
            });
        });
    }
});
