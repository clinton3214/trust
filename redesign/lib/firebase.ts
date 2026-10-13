import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot 
} from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyBIiAa2U8yVlVrjIrWXsaYEXojmp2wzVJc",
  authDomain: "trust-4570e.firebaseapp.com",
  projectId: "trust-4570e",
  storageBucket: "trust-4570e.firebasestorage.app",
  messagingSenderId: "543467848148",
  appId: "1:543467848148:web:e2acd86387f20a4a629641"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

// Single global document reference point for cross-device syncing
export const dbRef = doc(db, "app_state", "global_data");

export interface Transaction {
  id: string;
  payee: string;
  account?: string;
  bank?: string;
  date: string;
  amount: number;
  type: string;
  status: 'Approved' | 'Pending' | 'Blocked' | 'Declined' | string;
  category?: string;
  createdAt: number;
  note?: string;
}

export interface UserProfile {
  name: string;
  dob: string;
  email: string;
  phone: string;
  address: string;
  checking: string;
  routing: string;
  savings: string;
  avatar?: string;
}

export interface Message {
  sender: 'User' | 'Admin' | string;
  text: string;
  time: string;
}

export const defaultTransactions: Transaction[] = [
  { id: 't1', payee: 'Apple Store', date: 'Today, 10:14 AM', amount: -899.00, type: 'card outgoing', status: 'Approved', category: 'Hardware', createdAt: Date.now() - 10000000 },
  { id: 't2', payee: 'Payroll Direct Deposit', date: 'Yesterday', amount: 4250.00, type: 'incoming', status: 'Approved', category: 'Acme Corp', createdAt: Date.now() - 20000000 },
  { id: 't3', payee: 'Whole Foods Market', date: 'Oct 22, 2025', amount: -84.20, type: 'card outgoing', status: 'Approved', category: 'Groceries', createdAt: Date.now() - 30000000 }
];

export const defaultProfile: UserProfile = {
  name: 'Alex Morgan',
  dob: 'March 14, 1991',
  email: 'alex.morgan@domain.com',
  phone: '+1 (555) 234-8901',
  address: '742 Evergreen Terrace, Suite 400, San Francisco, CA 94107',
  checking: '0923 8491 4820',
  routing: '121000358',
  savings: '3847 2910 9104'
};

export const defaultState = {
  tb_balance: 24850.40,
  tb_transferLimit: 5000.00,
  tb_transactions: defaultTransactions,
  tb_profile: defaultProfile,
  tb_messages: [] as Message[],
  tb_user_email: '@trustbank25',
  tb_user_pass: '222653',
  tb_admin_email: 'admin@com',
  tb_admin_pass: '00000',
  tb_transfer_pin: '4476'
};

export function formatCurrency(value: number | string | undefined | null): string {
  const amount = Number.parseFloat(String(value ?? 0));
  return Number.isFinite(amount)
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
    : '$0.00';
}

// Checks if database is blank. If true, pushes starting state up to Firestore.
export async function initializeState() {
  if (typeof window === 'undefined') return;
  try {
    const docSnap = await getDoc(dbRef);
    if (!docSnap.exists()) {
      await setDoc(dbRef, defaultState);
      console.log("Firebase Database successfully pre-populated with baseline datasets!");
    } else {
      const data = docSnap.data();
      const patches: Record<string, any> = {};

      if (typeof data.tb_balance === 'string') {
        patches.tb_balance = parseFloat(data.tb_balance) || 0;
      }
      if (typeof data.tb_transferLimit === 'string') {
        patches.tb_transferLimit = parseFloat(data.tb_transferLimit) || 0;
      }
      // Ensure transfer PIN exists
      if (!data.tb_transfer_pin) {
        patches.tb_transfer_pin = '4476';
      }

      if (Object.keys(patches).length > 0) {
        await setDoc(dbRef, patches, { merge: true });
      }
    }
  } catch (error) {
    console.error("Initialization failure:", error);
  }
}

// PROFILE LOGIC
export async function getProfile(): Promise<UserProfile> {
  try {
    const docSnap = await getDoc(dbRef);
    return docSnap.exists() && docSnap.data().tb_profile 
      ? { ...defaultProfile, ...docSnap.data().tb_profile } 
      : defaultProfile;
  } catch (error) {
    console.error("Read failure (profile):", error);
    return defaultProfile;
  }
}

export async function setProfile(profileObj: UserProfile) {
  try {
    await setDoc(dbRef, { tb_profile: profileObj }, { merge: true });
  } catch (error) {
    console.error("Write failure (profile):", error);
  }
}

// BALANCE & CONFIG LOGIC
export async function getFinancials() {
  try {
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

export async function updateFinancials(balance: number, limit: number) {
  try {
    await setDoc(dbRef, { 
      tb_balance: parseFloat(Number(balance).toFixed(2)), 
      tb_transferLimit: parseFloat(Number(limit).toFixed(2)) 
    }, { merge: true });
  } catch (error) {
    console.error("Write failure (financials):", error);
  }
}

// TRANSACTIONS LOGIC
export async function getTransactions(): Promise<Transaction[]> {
  try {
    const docSnap = await getDoc(dbRef);
    return docSnap.exists() ? (docSnap.data().tb_transactions || []) : defaultTransactions;
  } catch (error) {
    console.error("Read failure (transactions):", error);
    return defaultTransactions;
  }
}

export async function addTransaction(newTx: Partial<Transaction>): Promise<string | null> {
  try {
    const docSnap = await getDoc(dbRef);
    const currentTx: Transaction[] = docSnap.exists() ? (docSnap.data().tb_transactions || []) : [];
    const transaction: Transaction = {
      id: newTx.id || `tx-${Date.now()}`,
      payee: newTx.payee || 'Unknown Payee',
      account: newTx.account,
      bank: newTx.bank,
      date: newTx.date || new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      amount: newTx.amount ?? 0,
      type: newTx.type || 'outgoing',
      status: newTx.status || 'Pending',
      category: newTx.category || 'Transfer',
      createdAt: newTx.createdAt || Date.now()
    };
    await setDoc(dbRef, { tb_transactions: [transaction, ...currentTx] }, { merge: true });
    return transaction.id;
  } catch (error) {
    console.error("Write failure (transaction):", error);
    return null;
  }
}

export async function updateTransactionStatus(id: string, status: string, note: string = '') {
  try {
    const docSnap = await getDoc(dbRef);
    if (!docSnap.exists()) return;
    const data = docSnap.data();
    const transactions: Transaction[] = data.tb_transactions || [];
    let currentBalance = parseFloat(data.tb_balance) || 0;

    let deductedAmount = 0;
    const updatedTransactions = transactions.map(transaction => {
      if (transaction.id === id) {
        // Only deduct balance when approving an outgoing transaction
        if (status === 'Approved' && transaction.status !== 'Approved') {
          const amt = parseFloat(String(transaction.amount)) || 0;
          if (amt < 0) {
            deductedAmount = amt;
            currentBalance += amt;
          }
        }
        return { ...transaction, status, ...(note ? { note } : {}) };
      }
      return transaction;
    });

    const newBalance = parseFloat(currentBalance.toFixed(2));
    await setDoc(dbRef, { 
      tb_transactions: updatedTransactions, 
      tb_balance: newBalance
    }, { merge: true });
  } catch (err) {
    console.error('updateTransactionStatus error:', err);
  }
}

export async function getTransaction(id: string): Promise<Transaction | null> {
  const transactions = await getTransactions();
  return transactions.find(transaction => transaction.id === id) || null;
}

export async function clearTransactions() {
  try {
    await setDoc(dbRef, { tb_transactions: [] }, { merge: true });
  } catch (error) {
    console.error("Failed to clear transactions:", error);
  }
}

// MESSAGES LOGIC
export async function getMessages(): Promise<Message[]> {
  try {
    const docSnap = await getDoc(dbRef);
    return docSnap.exists() ? (docSnap.data().tb_messages || []) : [];
  } catch (error) {
    console.error("Read failure (messages):", error);
    return [];
  }
}

export async function addMessage(msg: Message) {
  try {
    const docSnap = await getDoc(dbRef);
    const currentMsgs = docSnap.exists() ? (docSnap.data().tb_messages || []) : [];
    await setDoc(dbRef, { tb_messages: [...currentMsgs, msg] }, { merge: true });
  } catch (error) {
    console.error("Write failure (message):", error);
  }
}

export async function clearMessages() {
  try {
    await setDoc(dbRef, { tb_messages: [] }, { merge: true });
  } catch (error) {
    console.error("Failed to clear messages:", error);
  }
}

// REAL-TIME EVENT STREAM LISTENER
export function listenToDatabaseChanges(callback: (data: any) => void) {
  if (typeof window === 'undefined') return () => {};
  return onSnapshot(dbRef, (snapshot) => {
    callback(snapshot.exists() ? snapshot.data() : null);
  }, (err) => {
    console.error("Snapshot error:", err);
  });
}

// PASSWORDS & SECURITY PIN LOGIC
export async function getPasswords() {
  try {
    const docSnap = await getDoc(dbRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        userEmail: data.tb_user_email || '@trustbank25',
        userPass: data.tb_user_pass || '222653',
        adminEmail: data.tb_admin_email || 'admin@com',
        adminPass: data.tb_admin_pass || '00000',
        transferPin: data.tb_transfer_pin || '4476'
      };
    }
  } catch (err) {
    console.error("Read failure (passwords):", err);
  }
  return { 
    userEmail: '@trustbank25', 
    userPass: '222653', 
    adminEmail: 'admin@com', 
    adminPass: '00000', 
    transferPin: '4476' 
  };
}

export async function updateSecurityCredentials(opts: {
  userEmail?: string;
  userPass?: string;
  adminEmail?: string;
  adminPass?: string;
  transferPin?: string;
}) {
  try {
    const patches: Record<string, string> = {};
    if (opts.userEmail) patches.tb_user_email = opts.userEmail;
    if (opts.userPass) patches.tb_user_pass = opts.userPass;
    if (opts.adminEmail) patches.tb_admin_email = opts.adminEmail;
    if (opts.adminPass) patches.tb_admin_pass = opts.adminPass;
    if (opts.transferPin) patches.tb_transfer_pin = opts.transferPin;

    if (Object.keys(patches).length > 0) {
      await setDoc(dbRef, patches, { merge: true });
      console.log("Security credentials updated in Firebase.");
    }
  } catch (err) {
    console.error("Write failure (security credentials):", err);
  }
}

export async function updatePasswords(userPass: string, adminPass: string) {
  return updateSecurityCredentials({ userPass, adminPass });
}

export async function getTransferPin(): Promise<string> {
  const creds = await getPasswords();
  return creds.transferPin;
}

export async function updateTransferPin(pin: string) {
  return updateSecurityCredentials({ transferPin: pin });
}
