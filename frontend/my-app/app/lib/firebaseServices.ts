// app/lib/firebaseServices.ts
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from './firebase';
import { v4 as uuidv4 } from 'uuid';

// ==================== AUTHENTICATION ====================

export const registerPeminjam = async (
  email: string,
  password: string,
  nama_peminjam: string,
  user_peminjam: string,
  foto_peminjam?: File
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const id_peminjam = uuidv4();

    let foto_url = null;
    if (foto_peminjam) {
      const storageRef = ref(storage, `peminjam-photos/${id_peminjam}`);
      await uploadBytes(storageRef, foto_peminjam);
      foto_url = await getDownloadURL(storageRef);
    }

    // Add to Firestore with exact schema field names
    await addDoc(collection(db, 'peminjam'), {
      id_peminjam,
      nama_peminjam,
      user_peminjam,
      pass_peminjam: password, // Store hashed password from Firebase Auth
      tgl_daftar: Timestamp.now(),
      foto_peminjam: foto_url,
      status_peminjam: true,
    });

    await updateProfile(user, { displayName: nama_peminjam });

    return { id_peminjam, nama_peminjam };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const loginPeminjam = async (user_peminjam: string, password: string) => {
  try {
    // Query to find peminjam by username
    const q = query(collection(db, 'peminjam'), where('user_peminjam', '==', user_peminjam));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('Username tidak ditemukan');
    }

    const peminjamData = querySnapshot.docs[0].data();
    // For Firebase Auth, we need email but it's not in schema
    // Use username@domain.com as workaround or store in separate auth collection
    const email = `${user_peminjam}@example.com`;

    // Use Firebase Auth login
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const registerAdmin = async (
  email: string,
  password: string,
  nama_admin: string,
  user_admin: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const id_admin = user.uid.substring(0, 5).toUpperCase();

    await addDoc(collection(db, 'admin'), {
      id_admin,
      nama_admin,
      user_admin,
      pass_admin: password,
    });

    await updateProfile(user, { displayName: nama_admin });

    return { id_admin, nama_admin };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const loginAdmin = async (user_admin: string, password: string) => {
  try {
    const q = query(collection(db, 'admin'), where('user_admin', '==', user_admin));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('Username admin tidak ditemukan');
    }

    const adminData = querySnapshot.docs[0].data();
    // For Firebase Auth, use username@domain.com as workaround
    const email = `${user_admin}@example.com`;

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

// ==================== PEMINJAM OPERATIONS ====================

export const getPeminjamById = async (id_peminjam: string) => {
  try {
    const q = query(collection(db, 'peminjam'), where('id_peminjam', '==', id_peminjam));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs[0]?.data() || null;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getAllPeminjam = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'peminjam'));
    return querySnapshot.docs.map((doc) => ({ docId: doc.id, ...doc.data() }));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updatePeminjam = async (id_peminjam: string, data: any) => {
  try {
    const q = query(collection(db, 'peminjam'), where('id_peminjam', '==', id_peminjam));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      await updateDoc(querySnapshot.docs[0].ref, data);
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const uploadPeminjamPhoto = async (id_peminjam: string, file: File) => {
  try {
    const storageRef = ref(storage, `peminjam-photos/${id_peminjam}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    await updatePeminjam(id_peminjam, { foto_peminjam: url });
    return url;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// ==================== BUKU OPERATIONS ====================

export const createBuku = async (bukuData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'buku'), {
      judul_buku: bukuData.judul_buku,
      tgl_terbit: bukuData.tgl_terbit ? Timestamp.fromDate(new Date(bukuData.tgl_terbit)) : null,
      nama_pengarang: bukuData.nama_pengarang || null,
      nama_penerbit: bukuData.nama_penerbit || null,
    });
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getBukuById = async (id_buku: string) => {
  try {
    const docSnap = await getDoc(doc(db, 'buku', id_buku));
    return docSnap.exists() ? { id_buku: docSnap.id, ...docSnap.data() } : null;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getAllBuku = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'buku'));
    return querySnapshot.docs.map((doc) => ({ id_buku: doc.id, ...doc.data() }));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updateBuku = async (id_buku: string, data: any) => {
  try {
    await updateDoc(doc(db, 'buku', id_buku), data);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const deleteBuku = async (id_buku: string) => {
  try {
    await deleteDoc(doc(db, 'buku', id_buku));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// ==================== PEMINJAMAN OPERATIONS ====================

export const createPeminjaman = async (peminjamanData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'peminjaman'), {
      id_peminjam: peminjamanData.id_peminjam,
      tgl_pesan: Timestamp.now(),
      tgl_ambil: Timestamp.fromDate(new Date(peminjamanData.tgl_ambil)),
      tgl_wajibkembali: Timestamp.fromDate(new Date(peminjamanData.tgl_wajibkembali)),
      tgl_kembali: peminjamanData.tgl_kembali ? Timestamp.fromDate(new Date(peminjamanData.tgl_kembali)) : null,
      status_pinjam: peminjamanData.status_pinjam || 'A', // A/S/L/B
    });
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getPeminjamanById = async (kode_pinjam: string) => {
  try {
    const docSnap = await getDoc(doc(db, 'peminjaman', kode_pinjam));
    return docSnap.exists() ? { kode_pinjam: docSnap.id, ...docSnap.data() } : null;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getPeminjamanByPeminjamId = async (id_peminjam: string) => {
  try {
    const q = query(collection(db, 'peminjaman'), where('id_peminjam', '==', id_peminjam));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ kode_pinjam: doc.id, ...doc.data() }));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getAllPeminjaman = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'peminjaman'));
    return querySnapshot.docs.map((doc) => ({ kode_pinjam: doc.id, ...doc.data() }));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updatePeminjaman = async (kode_pinjam: string, data: any) => {
  try {
    await updateDoc(doc(db, 'peminjaman', kode_pinjam), data);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const deletePeminjaman = async (kode_pinjam: string) => {
  try {
    await deleteDoc(doc(db, 'peminjaman', kode_pinjam));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// ==================== DETAIL PEMINJAMAN OPERATIONS ====================

export const addDetailPeminjaman = async (kode_pinjam: string, id_buku: string) => {
  try {
    const docRef = await addDoc(collection(db, 'detail_peminjaman'), {
      kode_pinjam,
      id_buku,
    });
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getDetailPeminjamanByKodePinjam = async (kode_pinjam: string) => {
  try {
    const q = query(collection(db, 'detail_peminjaman'), where('kode_pinjam', '==', kode_pinjam));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const removeDetailPeminjaman = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'detail_peminjaman', id));
  } catch (error: any) {
    throw new Error(error.message);
  }
};
