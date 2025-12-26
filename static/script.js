const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const resultsSection = document.getElementById('resultsSection');
const originalImage = document.getElementById('originalImage');
const detectionStatus = document.getElementById('detectionStatus');
const fractureCount = document.getElementById('fractureCount');
const classificationResult = document.getElementById('classificationResult');
const boundingBoxesList = document.getElementById('boundingBoxes');

let selectedFile = null;

// Click to upload
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

// Drag and drop handlers
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

// File input change
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

function handleFile(file) {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
        alert('Please upload a JPG or JPEG image file.');
        return;
    }

    selectedFile = file;
    uploadBtn.disabled = false;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        originalImage.src = e.target.result;
    };
    reader.readAsDataURL(file);

    // Update upload area text
    const uploadText = uploadArea.querySelector('.upload-text');
    uploadText.textContent = `Selected: ${file.name}`;
}

// Upload button click
uploadBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    // Show loading state
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<span class="loading"></span> Analyzing...';

    // Reset results
    resultsSection.style.display = 'block';
    detectionStatus.textContent = 'Processing...';
    detectionStatus.className = 'status-badge processing';
    fractureCount.textContent = '-';
    classificationResult.textContent = '-';
    boundingBoxesList.innerHTML = '';

    // Create form data
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
        // Send to API
        const response = await fetch('/predict', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        // Display results
        displayResults(data);

    } catch (error) {
        console.error('Error:', error);
        detectionStatus.textContent = 'Error';
        detectionStatus.className = 'status-badge error';
        alert(`Error: ${error.message}`);
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Analyze Image';
    }
});

function displayResults(data) {
    // Update status
    detectionStatus.textContent = 'Complete';
    detectionStatus.className = 'status-badge success';

    // Display fracture count
    const count = data.boxes ? data.boxes.length : 0;
    fractureCount.textContent = count;

    // Display classification result
    if (data.results !== undefined) {
        classificationResult.textContent = data.results;
    }

    // Display bounding boxes
    if (data.boxes && data.boxes.length > 0) {
        boundingBoxesList.innerHTML = '<h4>Detected Fractures:</h4>';
        data.boxes.forEach((box, index) => {
            const [x, y, w, h] = box;
            const boxItem = document.createElement('div');
            boxItem.className = 'box-item';
            boxItem.innerHTML = `
                <strong>Fracture #${index + 1}</strong><br>
                Position: X=${x.toFixed(1)}, Y=${y.toFixed(1)}<br>
                Size: W=${w.toFixed(1)}, H=${h.toFixed(1)}
            `;
            boundingBoxesList.appendChild(boxItem);
        });

        // Draw boxes on image
        drawBoundingBoxes(data.boxes);
    } else {
        boundingBoxesList.innerHTML = '<p>No fractures detected</p>';
    }
}

function drawBoundingBoxes(boxes) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Draw bounding boxes
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;

        boxes.forEach((box, index) => {
            const [centerX, centerY, width, height] = box;

            // Convert from center coordinates to top-left
            const x = centerX - width / 2;
            const y = centerY - height / 2;

            // Draw rectangle
            ctx.strokeRect(x, y, width, height);

            // Draw label
            ctx.fillStyle = '#ff0000';
            ctx.font = 'bold 16px Arial';
            ctx.fillText(`Fracture ${index + 1}`, x, y - 5);
        });

        // Update image with boxes
        originalImage.src = canvas.toDataURL();
    };

    img.src = originalImage.src;
}
