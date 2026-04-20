const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const uploadSection = document.getElementById('uploadSection');
const uploadProgress = document.getElementById('uploadProgress');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const resultSection = document.getElementById('resultSection');
const codeText = document.getElementById('codeText');
const qrCode = document.getElementById('qrCode');
const copyBtn = document.getElementById('copyBtn');
const uploadAnotherBtn = document.getElementById('uploadAnotherBtn');
const downloadCode = document.getElementById('downloadCode');
const downloadBtn = document.getElementById('downloadBtn');
const downloadError = document.getElementById('downloadError');

browseBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  handleFile(e.dataTransfer.files[0]);
});

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function handleFile(file) {
  if (!file) return;

  uploadProgress.classList.remove('hidden');
  progressFill.style.width = '0%';
  progressText.textContent = 'Uploading...';

  try {
    progressFill.style.width = '30%';

    // Convert file to base64
    const base64File = await fileToBase64(file);

    progressFill.style.width = '60%';

    // Send to API
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: base64File,
        fileName: file.name,
        mimeType: file.type,
      }),
    });

    progressFill.style.width = '100%';

    if (!response.ok) throw new Error('Upload failed');

    const data = await response.json();

    progressText.textContent = 'Upload complete!';

    setTimeout(() => {
      uploadProgress.classList.add('hidden');
      resultSection.classList.remove('hidden');
      codeText.textContent = data.code;
      qrCode.src = data.qrCode;
    }, 500);

  } catch (error) {
    console.error('Upload error:', error);
    progressText.textContent = 'Upload failed. Please try again.';
    progressText.style.color = '#d93025';
  }
}

copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(codeText.textContent);
    copyBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
    setTimeout(() => {
      copyBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
    }, 2000);
  } catch (error) {
    console.error('Copy failed:', error);
  }
});

uploadAnotherBtn.addEventListener('click', () => {
  resultSection.classList.add('hidden');
  fileInput.value = '';
});

downloadBtn.addEventListener('click', () => {
  const code = downloadCode.value.trim();
  downloadError.classList.add('hidden');

  if (code.length !== 6 || !/^\d{6}$/.test(code)) {
    downloadError.textContent = 'Please enter a valid 6-digit code';
    downloadError.classList.remove('hidden');
    return;
  }

  window.location.href = `/api/download?code=${code}`;
});

downloadCode.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') downloadBtn.click();
});

downloadCode.addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '');
});