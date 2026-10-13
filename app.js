import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import { firebaseConfig } from "./redesign/lib/firebase.ts";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Single global document reference point for cross-device syncing
const dbRef = doc(db, "app_state", "global_data");

const defaultTransactions = [
  { id: 't1', payee: 'Apple Store', date: 'Today, 10:14 AM', amount: -899.00, type: 'card outgoing', status: 'Approved', category: 'Hardware', createdAt: Date.now() - 10000000 },
  { id: 't2', payee: 'Payroll Direct Deposit', date: 'Yesterday', amount: 4250.00, type: 'incoming', status: 'Approved', category: 'Acme Corp', createdAt: Date.now() - 20000000 },
  { id: 't3', payee: 'Whole Foods Market', date: 'Oct 22, 2025', amount: -84.20, type: 'card outgoing', status: 'Approved', category: 'Groceries', createdAt: Date.now() - 30000000 }
];

const defaultProfile = {
  name: 'Alex Morgan',
  dob: 'March 14, 1991',
  email: 'alex.morgan@domain.com',
  phone: '+1 (555) 234-8901',
  address: '742 Evergreen Terrace, Suite 400, San Francisco, CA 94107',
  checking: '0923 8491 4820',
  routing: '121000358',
  savings: '3847 2910 9104'
};

const defaultState = {
  tb_balance: 24850.40,
  tb_transferLimit: 5000.00,
  tb_transactions: defaultTransactions,
  tb_profile: defaultProfile,
  tb_messages: [],
  tb_user_email: '@trustbank25',
  tb_user_pass: '222653',
  tb_admin_email: 'admin@com',
  tb_admin_pass: '00000',
  tb_transfer_pin: '4476'
};

export function formatCurrency(value) {
  const amount = Number.parseFloat(value);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
    : '$0.00';
}

const initialization = initializeState();

// Checks if database is blank. If true, pushes starting state up to Firestore.
export async function initializeState() {
  try {
    const docSnap = await getDoc(dbRef);
    if (!docSnap.exists()) {
      await setDoc(dbRef, defaultState);
      console.log("Firebase Database successfully pre-populated with baseline datasets!");
    } else {
      const data = docSnap.data();
      const patches = {};



      // Normalize balance from string to number if needed
      if (typeof data.tb_balance === 'string') {
        patches.tb_balance = parseFloat(data.tb_balance) || 0;
        console.log("Normalized tb_balance from string to number:", patches.tb_balance);
      }
      if (typeof data.tb_transferLimit === 'string') {
        patches.tb_transferLimit = parseFloat(data.tb_transferLimit) || 0;
        console.log("Normalized tb_transferLimit from string to number:", patches.tb_transferLimit);
      }

      if (Object.keys(patches).length > 0) {
        await setDoc(dbRef, patches, { merge: true });
      }
    }
  } catch (error) {
    console.error("Initialization failure:", error);
  }
}

export async function clearMessages() {
  try {
    await initialization;
    await setDoc(dbRef, { tb_messages: [] }, { merge: true });
    console.log("Messages cleared.");
  } catch (error) {
    console.error("Failed to clear messages:", error);
  }
}

export async function clearTransactions() {
  try {
    await initialization;
    await setDoc(dbRef, { tb_transactions: [] }, { merge: true });
    console.log("Transactions cleared.");
  } catch (error) {
    console.error("Failed to clear transactions:", error);
  }
}


export const initState = initializeState;

// PROFILE LOGIC
export async function getProfile() {
  try {
    await initialization;
    const docSnap = await getDoc(dbRef);
    return docSnap.exists() ? { ...defaultProfile, ...docSnap.data().tb_profile } : defaultProfile;
  } catch (error) {
    console.error("Read failure (profile):", error);
    return defaultProfile;
  }
}

export async function setProfile(profileObj) {
  try {
    await initialization;
    await setDoc(dbRef, { tb_profile: profileObj }, { merge: true });
    console.log("Profile synchronized cross-device.");
  } catch (error) {
    console.error("Write failure (profile):", error);
  }
}

// BALANCE & CONFIG LOGIC
export async function getFinancials() {
  try {
    await initialization;
    const docSnap = await getDoc(dbRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { 
        balance: parseFloat(data.tb_balance) || 0, 
        limit: parseFloat(data.tb_transferLimit) || 0 
      };
    }
    return { balance: 24850.40, limit: 5000.00 };
  } catch (error) {
    console.error("Read failure (financials):", error);
    return { balance: 24850.40, limit: 5000.00 };
  }
}

export async function updateFinancials(balance, limit) {
  try {
    await initialization;
    await setDoc(dbRef, { 
      tb_balance: parseFloat(parseFloat(balance).toFixed(2)), 
      tb_transferLimit: parseFloat(parseFloat(limit).toFixed(2)) 
    }, { merge: true });
    console.log("Financial modifications successfully synced.");
  } catch (error) {
    console.error("Write failure (financials):", error);
  }
}

// TRANSACTIONS LOGIC
export async function getTransactions() {
  try {
    await initialization;
    const docSnap = await getDoc(dbRef);
    return docSnap.exists() ? (docSnap.data().tb_transactions || []) : defaultTransactions;
  } catch (error) {
    console.error("Read failure (transactions):", error);
    return defaultTransactions;
  }
}

export async function addTransaction(newTx) {
  try {
    await initialization;
    const docSnap = await getDoc(dbRef);
    const currentTx = docSnap.exists() ? (docSnap.data().tb_transactions || []) : [];
    const transaction = {
      ...newTx,
      id: newTx.id || `tx-${Date.now()}`,
      date: newTx.date || new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      createdAt: newTx.createdAt || Date.now()
    };
    await setDoc(dbRef, { tb_transactions: [transaction, ...currentTx] }, { merge: true });
    return transaction.id;
  } catch (error) {
    console.error("Write failure (transaction):", error);
    return null;
  }
}

export async function updateTransactionStatus(id, status, note = '') {
  try {
    const docSnap = await getDoc(dbRef);
    if (!docSnap.exists()) return;
    const data = docSnap.data();
    const transactions = data.tb_transactions || [];
    let currentBalance = parseFloat(data.tb_balance) || 0;

    let deductedAmount = 0;
    const updatedTransactions = transactions.map(transaction => {
      if (transaction.id === id) {
        // Only deduct balance when first approving an outgoing transaction
        if (status === 'Approved' && transaction.status !== 'Approved') {
          const amt = parseFloat(transaction.amount) || 0;
          if (amt < 0) {
            deductedAmount = amt; // negative number
            currentBalance += amt; // subtract from balance
          }
        }
        return { ...transaction, status, ...(note ? { note } : {}) };
      }
      return transaction;
    });

    const newBalance = parseFloat(currentBalance.toFixed(2));
    console.log(`[updateTransactionStatus] id=${id} status=${status} deducted=${deductedAmount} newBalance=${newBalance}`);

    await setDoc(dbRef, { 
       tb_transactions: updatedTransactions, 
       tb_balance: newBalance
    }, { merge: true });
  } catch (err) {
    console.error('updateTransactionStatus error:', err);
  }
}

export async function getTransaction(id) {
  const transactions = await getTransactions();
  return transactions.find(transaction => transaction.id === id) || null;
}

// MESSAGES LOGIC
export async function getMessages() {
  try {
    await initialization;
    const docSnap = await getDoc(dbRef);
    return docSnap.exists() ? docSnap.data().tb_messages : [];
  } catch (error) {
    console.error("Read failure (messages):", error);
    return [];
  }
}

export async function addMessage(msg) {
  try {
    await initialization;
    const docSnap = await getDoc(dbRef);
    const currentMsgs = docSnap.exists() ? (docSnap.data().tb_messages || []) : [];
    await setDoc(dbRef, { tb_messages: [...currentMsgs, msg] }, { merge: true });
  } catch (error) {
    console.error("Write failure (message):", error);
  }
}

// ==========================================
// 4. REAL-TIME EVENT STREAM LISTENER
// ==========================================
export function listenToDatabaseChanges(callback) {
  let unsubscribe;
  initialization.then(() => {
    unsubscribe = onSnapshot(dbRef, snapshot => callback(snapshot.exists() ? snapshot.data() : null));
  });
  return () => unsubscribe?.();
}
// ==========================================
// 5. PASSWORD LOGIC
// ==========================================
export async function getPasswords() {
  try {
    await initialization;
    const docSnap = await getDoc(dbRef);
    if (docSnap.exists()) {
      return {
        userPass: docSnap.data().tb_user_pass || '',
        adminPass: docSnap.data().tb_admin_pass || ''
      };
    }
  } catch (err) {
    console.error("Read failure (passwords):", err);
  }
  return { userPass: '', adminPass: '' };
}

export async function updatePasswords(userPass, adminPass) {
  try {
    await initialization;
    const patches = {};
    if (userPass) patches.tb_user_pass = userPass;
    if (adminPass) patches.tb_admin_pass = adminPass;
    if (Object.keys(patches).length > 0) {
      await setDoc(dbRef, patches, { merge: true });
      console.log("Passwords updated in Firebase.");
    }
  } catch (err) {
    console.error("Write failure (passwords):", err);
  }
}

// ==========================================
// 6. AUTO LOGOUT LOGIC (2 HOURS)
// ==========================================
let inactivityTimer;
const INACTIVITY_LIMIT = 2 * 60 * 60 * 1000; // 2 hours

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
      window.location.href = 'index.html';
    }
  }, INACTIVITY_LIMIT);
}

// Ensure it only runs in browser environment
if (typeof window !== 'undefined') {
  window.addEventListener('mousemove', resetInactivityTimer);
  window.addEventListener('keydown', resetInactivityTimer);
  window.addEventListener('click', resetInactivityTimer);
  window.addEventListener('scroll', resetInactivityTimer);
  window.addEventListener('touchstart', resetInactivityTimer);
  resetInactivityTimer();
}
