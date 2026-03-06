const bookingForm = document.getElementById('bookingForm');
const bookingMessage = document.getElementById('bookingMessage');
const pricingList = document.getElementById('pricingList');

async function loadPricing() {
  const response = await fetch('/api/pricing');
  const items = await response.json();
  pricingList.innerHTML = '';

  items.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'price-card';
    card.innerHTML = `
      <div class="price-row">
        <h3>${item.service_name}</h3>
        <span class="amount">$${Number(item.price).toFixed(2)}</span>
      </div>
      <p>${item.description || ''}</p>
    `;
    pricingList.appendChild(card);
  });
}

bookingForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  bookingMessage.textContent = '';

  const formData = new FormData(bookingForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      bookingMessage.textContent = data.error || 'Could not submit booking.';
      bookingMessage.style.color = '#991b1b';
      return;
    }

    bookingMessage.textContent = 'Pickup request submitted. We will confirm by phone.';
    bookingMessage.style.color = '#14532d';
    bookingForm.reset();
  } catch (error) {
    bookingMessage.textContent = 'Network issue. Please try again.';
    bookingMessage.style.color = '#991b1b';
  }
});

loadPricing().catch(() => {
  pricingList.textContent = 'Could not load pricing right now.';
});
