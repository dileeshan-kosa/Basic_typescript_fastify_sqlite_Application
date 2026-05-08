import "./style.css";

// 1. Grab the empty shell from index.html
const app = document.querySelector<HTMLDivElement>("#app")!;

// 2. Inject our UI using Template Literals and Tailwind CSS
app.innerHTML = `
  <div class="bg-white p-8 rounded-xl shadow-lg border border-gray-200 relative overflow-hidden">
    <h1 class="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">User Management</h1>
    
    <div class="flex gap-4 mb-8">
      <button id="show-add-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm">
        Add User
      </button>
      <button id="show-list-btn" class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-5 py-2.5 rounded-lg transition-colors border border-gray-300 shadow-sm">
        Display Users
      </button>
    </div>

    <div id="form-section" class="block animate-fade-in">
      <h2 class="text-xl font-semibold mb-4 text-gray-700">Add a New User</h2>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
          <input type="text" id="name-input" placeholder="e.g. John Doe" class="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
          <input type="email" id="email-input" placeholder="e.g. john@example.com" class="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
        </div>
        <button id="submit-btn" class="w-full bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-3 rounded-lg transition-colors shadow-md mt-2">
          Save to Database
        </button>
      </div>
    </div>

    <div id="list-section" class="hidden animate-fade-in">
      <h2 class="text-xl font-semibold mb-4 text-gray-700">Database Records</h2>
      <div id="users-container" class="space-y-3">
        <!-- Users will be dynamically inserted here -->
      </div>
    </div>

    <div id="notification-popup" class="absolute bottom-4 right-4 bg-gray-800 text-white px-5 py-3 rounded-lg shadow-xl transform transition-all duration-300 translate-y-20 opacity-0 flex items-center gap-3">
      <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <span class="font-medium tracking-wide">Saved successfully!</span>
    </div>
  </div>
`;

// ==========================================
// 3. WIRING IT ALL TOGETHER (DOM Elements)
// ==========================================
const formSection = document.getElementById("form-section")!;
const listSection = document.getElementById("list-section")!;
const showAddBtn = document.getElementById("show-add-btn")!;
const showListBtn = document.getElementById("show-list-btn")!;

const submitBtn = document.getElementById('submit-btn')!;
const nameInput = document.getElementById('name-input') as HTMLInputElement;
const emailInput = document.getElementById('email-input') as HTMLInputElement;
const usersContainer = document.getElementById('users-container')!;
const notificationPopup = document.getElementById('notification-popup')!;

// Helper function to show the notification and hide it after 3 seconds
function showNotification() {
  // Slide up and fade in
  notificationPopup.classList.remove('translate-y-20', 'opacity-0');
  notificationPopup.classList.add('translate-y-0', 'opacity-100');

  // Wait 3 seconds, then slide down and fade out
  setTimeout(() => {
    notificationPopup.classList.remove('translate-y-0', 'opacity-100');
    notificationPopup.classList.add('translate-y-20', 'opacity-0');
  }, 3000);
}

// ==========================================
// 4. THE LOGIC (API Calls & UI Toggles)
// ==========================================

// When "Add User" top tab is clicked: Just show the form
showAddBtn.addEventListener("click", () => {
  formSection.classList.remove("hidden");
  formSection.classList.add("block");
  listSection.classList.add("hidden");
  listSection.classList.remove("block");
});

// When "Display Users" top tab is clicked: Fetch data AND show the list
showListBtn.addEventListener('click', async () => {
  // Toggle the UI
  formSection.classList.add("hidden");
  formSection.classList.remove("block");
  listSection.classList.remove("hidden");
  listSection.classList.add("block");

  // Fetch the data
  try {
    const response = await fetch('http://localhost:3000/api/users');
    const users = await response.json();

    usersContainer.innerHTML = ''; // Clear old data

    if (users.length === 0) {
      usersContainer.innerHTML = '<p class="text-gray-500 italic">No users found in the database yet.</p>';
      return;
    }

    users.forEach((user: { id: number, name: string, email: string }) => {
      const card = document.createElement('div');
      card.className = 'p-4 bg-white border-l-4 border-blue-500 rounded-r-lg shadow-sm mb-3';
      card.innerHTML = `
        <p class="font-bold text-gray-800 text-lg">${user.name}</p>
        <p class="text-sm text-gray-500">${user.email}</p>
        <p class="text-xs text-gray-400 mt-2">Database ID: ${user.id}</p>
      `;
      usersContainer.appendChild(card);
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    usersContainer.innerHTML = '<p class="text-red-500 font-medium">Failed to load users. Is the Fastify backend running?</p>';
  }
});

// When "Save to Database" green button is clicked: Send data to Fastify
submitBtn.addEventListener('click', async () => {
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();

  if (!name || !email) {
    alert('Please fill in both the name and email fields.');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email })
    });

    const result = await response.json();
    
    if (result.success) {
      // Trigger our new custom notification instead of the old alert()!
      showNotification();
      
      // Clear the form fields
      nameInput.value = '';
      emailInput.value = '';
    }
  } catch (error) {
    console.error('Error saving user:', error);
    alert('Failed to save user. Make sure your Fastify backend is running!');
  }
});




// import "./style.css";

// // 1. Grab the empty shell from index.html
// const app = document.querySelector<HTMLDivElement>("#app")!;

// // 2. Inject our UI using Template Literals and Tailwind CSS
// app.innerHTML = `
//   <div class="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
//     <h1 class="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">User Management</h1>
    
//     <div class="flex gap-4 mb-8">
//       <button id="show-add-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm">
//         Add User
//       </button>
//       <button id="show-list-btn" class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-5 py-2.5 rounded-lg transition-colors border border-gray-300 shadow-sm">
//         Display Users
//       </button>
//     </div>

//     <div id="form-section" class="block animate-fade-in">
//       <h2 class="text-xl font-semibold mb-4 text-gray-700">Add a New User</h2>
//       <div class="space-y-4">
//         <div>
//           <label class="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
//           <input type="text" id="name-input" placeholder="e.g. John Doe" class="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
//         </div>
//         <div>
//           <label class="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
//           <input type="email" id="email-input" placeholder="e.g. john@example.com" class="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
//         </div>
//         <button id="submit-btn" class="w-full bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-3 rounded-lg transition-colors shadow-md mt-2">
//           Save to Database
//         </button>
//       </div>
//     </div>

//     <div id="list-section" class="hidden animate-fade-in">
//       <h2 class="text-xl font-semibold mb-4 text-gray-700">Database Records</h2>
//       <div id="users-container" class="space-y-3">
//         <div class="p-4 bg-gray-50 border-l-4 border-blue-500 rounded-r-lg shadow-sm">
//           <p class="font-bold text-gray-800">Jane Smith</p>
//           <p class="text-sm text-gray-500">jane.smith@example.com</p>
//         </div>
//       </div>
//     </div>
//   </div>
// `;

// // 3. Add Interactivity (The Logic)
// const formSection = document.getElementById("form-section")!;
// const listSection = document.getElementById("list-section")!;
// const showAddBtn = document.getElementById("show-add-btn")!;
// const showListBtn = document.getElementById("show-list-btn")!;

// // Switch to Add User view
// showAddBtn.addEventListener("click", () => {
//   formSection.classList.remove("hidden");
//   formSection.classList.add("block");
//   listSection.classList.add("hidden");
//   listSection.classList.remove("block");
// });

// // Switch to Display Users view
// showListBtn.addEventListener("click", () => {
//   formSection.classList.add("hidden");
//   formSection.classList.remove("block");
//   listSection.classList.remove("hidden");
//   listSection.classList.add("block");
// });

