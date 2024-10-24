const canvas = document.getElementById('signaturePad');
const ctx = canvas.getContext('2d');
let drawing = false;

// Configuração de dimensionamento do canvas para alta definição
canvas.width = window.innerWidth * 2;
canvas.height = window.innerHeight * 0.5 * 2;
canvas.style.width = window.innerWidth + "px";
canvas.style.height = window.innerHeight * 0.5 + "px";
ctx.scale(2, 2);

// Eventos para desktop
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mousemove', draw);

// Eventos para mobile
canvas.addEventListener('touchstart', startDrawingTouch, { passive: false });
canvas.addEventListener('touchend', stopDrawing, { passive: false });
canvas.addEventListener('touchmove', drawTouch, { passive: false });

function startDrawing(e) {
    drawing = true;
    draw(e);
}

function startDrawingTouch(e) {
    drawing = true;
    drawTouch(e);
}

function stopDrawing() {
    drawing = false;
    ctx.beginPath();
}

function draw(e) {
    if (!drawing) return;

    e.preventDefault(); // Prevenir ações padrão como rolagem

    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function drawTouch(e) {
    if (!drawing) return;

    e.preventDefault(); // Prevenir ações padrão como rolagem

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';

    ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
}

function clearSignature() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

async function saveSignatureAndDocument() {
    const fileInput = document.getElementById('fileUpload');
    const name = document.getElementById('name').value;
    if (fileInput.files.length === 0 || !name) {
        alert('Por favor, selecione um documento e preencha seu nome.');
        return;
    }
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = async function(e) {
        const pdfBytes = await fetch(e.target.result).then(res => res.arrayBuffer());
        const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
        const signatureImage = canvas.toDataURL();
        const pngImageBytes = await fetch(signatureImage).then(res => res.arrayBuffer());
        const pngImage = await pdfDoc.embedPng(pngImageBytes);

        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const { width, height } = firstPage.getSize();
        firstPage.drawImage(pngImage, {
            x: 50,
            y: height - 150,
            width: 200,
            height: 100,
        });
        const pdfBytesSigned = await pdfDoc.save();
        const blob = new Blob([pdfBytesSigned], { type: 'application/pdf' });
        const link = document.getElementById('downloadLink');
        link.href = URL.createObjectURL(blob);
        document.getElementById('savedSignature').style.display = 'block';
    };
    reader.readAsDataURL(file);
}
