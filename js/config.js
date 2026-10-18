const COLORS = ['#E3A008', '#2A8C82', '#E0603F', '#6A4C93', '#3A7D44', '#2E5EAA'];
const STORAGE_KEY = 'homeroom-data';

// --- Backend setup ---
// Fill these in with your own Firebase project's config (see deployment steps).
// Until you do, the app falls back to Claude's built-in storage for this preview,
// and access control is skipped (you're treated as a single local admin).
const firebaseConfig = {
  apiKey: "AIzaSyCOY7Y-Ul3SmhO8BKLnik1k31KAq77rdWQ",
  authDomain: "homework-tracker-58087.firebaseapp.com",
  projectId: "homework-tracker-58087",
  storageBucket: "homework-tracker-58087.firebasestorage.app",
  messagingSenderId: "896517151831",
  appId: "1:896517151831:web:21c67d998d5fe4cab91712",
  measurementId: "G-1LL49KXYEQ"
};


const USE_FIREBASE = firebaseConfig.apiKey !== "YOUR_API_KEY";
let db = null;
let auth = null;

let state = { children: [], activeChildId: null };
let modal = null; // { type: 'child' | 'subject' | 'deleteChild', childId? }

// Auth/role state
let currentUser = null;      // Firebase user object, or null
let currentRole = null;      // 'admin' | 'guest' | null
let authMode = 'signin';     // 'signin' | 'signup'
let authError = '';
let authBusy = false;
let saveError = ''; // shown as a dismissable banner when a Firestore write fails
let childFilter = ''; // free-text filter for the child tabs, useful once there are many children

function dismissSaveError() { saveError = ''; render(); }
