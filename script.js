let cartCount = 0;

function addToCart(button) {
  cartCount++;
  document.getElementById("cart-count").textContent = cartCount;

  // Tambahkan animasi ketika tombol ditekan
  button.textContent = "✅ Ditambahkan!";
  button.disabled = true;

  setTimeout(() => {
    button.textContent = "Tambah ke Keranjang";
    button.disabled = false;
  }, 1500);
}
