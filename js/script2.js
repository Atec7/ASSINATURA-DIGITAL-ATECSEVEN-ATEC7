const canvas = document.getElementById('signaturePad');
const ctx = canvas.getContext('2d');
let drawing = false;

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mousemove', draw);

function startDrawing(e) {
    drawing = true;
    draw(e);
}

function stopDrawing() {
    drawing = false;
    ctx.beginPath();
}

function draw(e) {
    if (!drawing) return;
    
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';

    ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
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
