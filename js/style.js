const scriptURL = 'https://script.google.com/macros/s/AKfycbzTqtLF1OU7K-MG-rDgKXyxK296Ig-fvXF5Jzlpm7HsHODZfxzLylv3TgefVUClWZjGsQ/exec';
const form = document.getElementById('formSaran');
const status = document.getElementById('status');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = {
        nama: document.getElementById('nama').value,
        saran: document.getElementById('saran').value
    };

    fetch(scriptURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            status.textContent = "Saran berhasil dikirim!";
            status.style.color = "green";
            form.reset();
        })
        .catch(error => {
            status.textContent = "Gagal mengirim saran.";
            status.style.color = "red";
            console.error('Error!', error.message);
        });
});
