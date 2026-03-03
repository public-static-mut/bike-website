const SLOT_OPTIONS = [
  "8:00 AM - 9:00 AM",
  "9:30 AM - 10:30 AM",
  "11:00 AM - 12:00 PM",
  "1:00 PM - 2:00 PM",
  "2:30 PM - 3:30 PM",
  "4:00 PM - 5:00 PM",
  "5:30 PM - 6:30 PM"
];

const SERVICE_PACKAGES = {
  express: { label: "Express Tune-Up", price: 49, shopAverage: 85 },
  drivetrain: { label: "Drivetrain Deep Clean", price: 35, shopAverage: 60 },
  flat: { label: "Flat Fix + Safety Check", price: 24, shopAverage: 42 },
  brakeshift: { label: "Brake & Shift Dial-In", price: 39, shopAverage: 70 }
};

const ADDONS = {
  sameDay: { label: "Same-day turnaround", price: 18 },
  wash: { label: "Bike wash + frame detail", price: 12 },
  partsCheck: { label: "Parts check and quote", price: 10 }
};

const STORAGE_KEY = "spokeAndWrenchBookings";

const form = document.getElementById("booking-form");
const dateInput = document.getElementById("pickup-date");
const slotSelect = document.getElementById("pickup-slot");
const serviceSelect = document.getElementById("service-package");
const estimateBox = document.getElementById("estimate-box");
const bookingsList = document.getElementById("bookings-list");

const today = new Date();
const todayIso = formatDateLocal(today);
dateInput.min = todayIso;

if (!dateInput.value) {
  dateInput.value = todayIso;
}

initialize();

function formatDateLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function initialize() {
  updateSlotOptions(dateInput.value);
  updateEstimate();
  renderBookings();

  dateInput.addEventListener("change", () => updateSlotOptions(dateInput.value));
  serviceSelect.addEventListener("change", updateEstimate);
  form.querySelectorAll("input[name='addon']").forEach((checkbox) => {
    checkbox.addEventListener("change", updateEstimate);
  });
  form.addEventListener("submit", handleSubmit);
}

function getBookings() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveBookings(bookings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

function updateSlotOptions(date) {
  const bookings = getBookings();
  const bookedSlots = new Set(
    bookings.filter((item) => item.date === date).map((item) => item.slot)
  );

  slotSelect.innerHTML = "";

  const availableSlots = SLOT_OPTIONS.filter((slot) => !bookedSlots.has(slot));
  if (availableSlots.length === 0) {
    const option = document.createElement("option");
    option.textContent = "No pickup windows left on this date";
    option.value = "";
    slotSelect.appendChild(option);
    slotSelect.disabled = true;
    return;
  }

  slotSelect.disabled = false;

  const placeholder = document.createElement("option");
  placeholder.textContent = "Choose pickup window";
  placeholder.value = "";
  slotSelect.appendChild(placeholder);

  availableSlots.forEach((slot) => {
    const option = document.createElement("option");
    option.value = slot;
    option.textContent = slot;
    slotSelect.appendChild(option);
  });
}

function getSelectedAddons() {
  const checkboxes = form.querySelectorAll("input[name='addon']:checked");
  return [...checkboxes].map((item) => item.value);
}

function calculateEstimate() {
  const packageKey = serviceSelect.value;
  const packageInfo = SERVICE_PACKAGES[packageKey];
  const addonKeys = getSelectedAddons();

  const addonTotal = addonKeys.reduce((sum, key) => sum + ADDONS[key].price, 0);
  const total = packageInfo.price + addonTotal;
  const savings = packageInfo.shopAverage - packageInfo.price;

  return {
    packageInfo,
    addonKeys,
    total,
    savings
  };
}

function updateEstimate() {
  const estimate = calculateEstimate();

  estimateBox.textContent = `Estimated total: $${estimate.total} | You save about $${estimate.savings} vs most shops on this service.`;
}

function handleSubmit(event) {
  event.preventDefault();

  const formData = new FormData(form);
  const date = String(formData.get("date") || "");
  const slot = String(formData.get("slot") || "");

  if (!slot) {
    alert("Please choose an available pickup window.");
    return;
  }

  if (date < todayIso) {
    alert("Please choose today or a future date.");
    return;
  }

  const bookings = getBookings();
  const alreadyBooked = bookings.some((booking) => booking.date === date && booking.slot === slot);
  if (alreadyBooked) {
    alert("That pickup window was just booked. Please choose another one.");
    updateSlotOptions(date);
    return;
  }

  const estimate = calculateEstimate();
  const booking = {
    id: Date.now(),
    name: String(formData.get("name") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    date,
    slot,
    serviceKey: serviceSelect.value,
    serviceLabel: estimate.packageInfo.label,
    addons: estimate.addonKeys.map((key) => ADDONS[key].label),
    notes: String(formData.get("notes") || "").trim(),
    total: estimate.total
  };

  bookings.push(booking);
  saveBookings(bookings);

  form.reset();
  dateInput.value = todayIso;
  updateSlotOptions(dateInput.value);
  updateEstimate();
  renderBookings();
}

function renderBookings() {
  const bookings = getBookings().sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) {
      return dateCompare;
    }
    return SLOT_OPTIONS.indexOf(a.slot) - SLOT_OPTIONS.indexOf(b.slot);
  });

  bookingsList.innerHTML = "";

  if (bookings.length === 0) {
    bookingsList.innerHTML = "<p>No pickups scheduled yet.</p>";
    return;
  }

  bookings.forEach((booking) => {
    const entry = document.createElement("article");
    entry.className = "booking-item";

    const addonsText = booking.addons.length > 0 ? `Add-ons: ${booking.addons.join(", ")}` : "Add-ons: none";
    const notesText = booking.notes ? `Notes: ${booking.notes}` : "Notes: none";

    entry.innerHTML = `
      <div class="booking-main">
        <p class="booking-time">${booking.date} | ${booking.slot}</p>
        <strong>$${booking.total}</strong>
      </div>
      <p class="booking-meta">${booking.name} (${booking.phone})</p>
      <p class="booking-meta">Service: ${booking.serviceLabel}</p>
      <p class="booking-meta">${addonsText}</p>
      <p class="booking-meta">${notesText}</p>
    `;

    bookingsList.appendChild(entry);
  });
}
