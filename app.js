// ASCII Character Sets
const charSets = {
    standard: ' .:-=+*#%@',
    detailed: ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
    blocks: ' ░▒▓█',
    minimal: ' .:#'
};

// DOM Elements
const uploadZone = document.getElementById('uploadZone');
const imageInput = document.getElementById('imageInput');
const controls = document.getElementById('controls');
const widthSlider = document.getElementById('widthSlider');
const widthValue = document.getElementById('widthValue');
const charsetSelect = document.getElementById('charsetSelect');
const invertCheck = document.getElementById('invertCheck');
const previewSection = document.getElementById('previewSection');
const asciiOutput = document.getElementById('asciiOutput');
const copyBtn = document.getElementById('copyBtn');
const copyText = document.getElementById('copyText');
const downloadBtn = document.getElementById('downloadBtn');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let currentImage = null;

// Event Listeners
uploadZone.addEventListener('click', () => imageInput.click());

uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
        handleImage(files[0]);
    }
});

imageInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleImage(e.target.files[0]);
    }
});

widthSlider.addEventListener('input', (e) => {
    widthValue.textContent = e.target.value;
    if (currentImage) {
        generateASCII();
    }
});

charsetSelect.addEventListener('change', () => {
    if (currentImage) {
        generateASCII();
    }
});

invertCheck.addEventListener('change', () => {
    if (currentImage) {
        generateASCII();
    }
});

copyBtn.addEventListener('click', copyToClipboard);
downloadBtn.addEventListener('click', downloadASCII);

// Handle Image Upload
function handleImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            currentImage = img;
            controls.classList.add('visible');
            generateASCII();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Generate ASCII Art
function generateASCII() {
    if (!currentImage) return;

    const width = parseInt(widthSlider.value);
    const charset = charSets[charsetSelect.value];
    const invert = invertCheck.checked;

    // Calculate dimensions maintaining aspect ratio
    // ASCII characters are roughly 2x taller than wide, so we compensate
    const aspectRatio = currentImage.height / currentImage.width;
    const height = Math.floor(width * aspectRatio * 0.5);

    // Set canvas size and draw image
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(currentImage, 0, 0, width, height);

    // Get image data
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    let ascii = '';

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const r = pixels[idx];
            const g = pixels[idx + 1];
            const b = pixels[idx + 2];
            const a = pixels[idx + 3];

            // Calculate brightness (luminance formula)
            let brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

            // Apply alpha
            brightness = brightness * (a / 255);

            // Invert if needed
            if (invert) {
                brightness = 1 - brightness;
            }

            // Map brightness to character
            const charIndex = Math.floor(brightness * (charset.length - 1));
            ascii += charset[charIndex];
        }
        ascii += '\n';
    }

    asciiOutput.textContent = ascii;
    previewSection.classList.add('visible');

    // Scroll to preview smoothly
    previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Copy to Clipboard
async function copyToClipboard() {
    const text = asciiOutput.textContent;
    
    try {
        await navigator.clipboard.writeText(text);
        
        // Visual feedback
        copyBtn.classList.add('copied');
        copyText.textContent = 'Copied!';
        
        setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyText.textContent = 'Copy to Clipboard';
        }, 2000);
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        copyBtn.classList.add('copied');
        copyText.textContent = 'Copied!';
        
        setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyText.textContent = 'Copy to Clipboard';
        }, 2000);
    }
}

// Download ASCII Art
function downloadASCII() {
    const text = asciiOutput.textContent;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ascii-art.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Prevent default drag behavior on document
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault());

