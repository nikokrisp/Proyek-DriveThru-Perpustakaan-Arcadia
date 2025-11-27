// lib/firebaseServices.ts
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
  QueryConstraint,
  Timestamp,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from './firebase';

// ==================== AUTHENTICATION ====================

export const registerPeminjam = async (
  email: string,
  password: string,
  namaPeminjam: string,
  userPeminjam: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile
    await updateProfile(user, { displayName: namaPeminjam });

    // Add to Firestore
    const peminjamRef = await addDoc(collection(db, 'peminjam'), {
      idPeminjam: user.uid,
      namaPeminjam,
      userPeminjam,
      email,
      tglDaftar: Timestamp.now(),
      fotoPeminjam: null,
      statusPeminjam: true,
    });

    return { uid: user.uid, email, namaPeminjam };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const loginPeminjam = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const registerAdmin = async (
  email: string,
  password: string,
  namaAdmin: string,
  userAdmin: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: namaAdmin });

    await addDoc(collection(db, 'admin'), {
      idAdmin: user.uid,
      namaAdmin,
      userAdmin,
      email,
    });

    return { uid: user.uid, email, namaAdmin };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const loginAdmin = async (email: string, password: string) => {
  try {
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

export const getPeminjamById = async (idPeminjam: string) => {
  try {
    const docSnap = await getDoc(doc(db, 'peminjam', idPeminjam));
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getAllPeminjam = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'peminjam'));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updatePeminjam = async (idPeminjam: string, data: any) => {
  try {
    await updateDoc(doc(db, 'peminjam', idPeminjam), data);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const uploadPeminjamPhoto = async (idPeminjam: string, file: File) => {
  try {
    const storageRef = ref(storage, `peminjam-photos/${idPeminjam}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    await updatePeminjam(idPeminjam, { fotoPeminjam: url });
    return url;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// ==================== BUKU OPERATIONS ====================

export const createBuku = async (bukuData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'buku'), {
      ...bukuData,
      tglTerbit: bukuData.tglTerbit ? new Date(bukuData.tglTerbit) : null,
    });
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getBukuById = async (idBuku: string) => {
  try {
    const docSnap = await getDoc(doc(db, 'buku', idBuku));
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getAllBuku = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'buku'));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updateBuku = async (idBuku: string, data: any) => {
  try {
    await updateDoc(doc(db, 'buku', idBuku), data);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const deleteBuku = async (idBuku: string) => {
  try {
    await deleteDoc(doc(db, 'buku', idBuku));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// ==================== PEMINJAMAN OPERATIONS ====================

export const createPeminjaman = async (peminjamanData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'peminjaman'), {
      ...peminjamanData,
      tglPesan: peminjamanData.tglPesan ? new Date(peminjamanData.tglPesan) : Timestamp.now(),
      tglAmbil: new Date(peminjamanData.tglAmbil),
      tglWajibKembali: new Date(peminjamanData.tglWajibKembali),
      tglKembali: peminjamanData.tglKembali ? new Date(peminjamanData.tglKembali) : null,
    });
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getPeminjamanById = async (kodePinjam: string) => {
  try {
    const docSnap = await getDoc(doc(db, 'peminjaman', kodePinjam));
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getPeminjamanByPeminjamId = async (idPeminjam: string) => {
  try {
    const q = query(collection(db, 'peminjaman'), where('idPeminjam', '==', idPeminjam));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getAllPeminjaman = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'peminjaman'));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updatePeminjaman = async (kodePinjam: string, data: any) => {
  try {
    await updateDoc(doc(db, 'peminjaman', kodePinjam), data);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const deletePeminjaman = async (kodePinjam: string) => {
  try {
    await deleteDoc(doc(db, 'peminjaman', kodePinjam));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// ==================== DETAIL PEMINJAMAN OPERATIONS ====================

export const addDetailPeminjaman = async (kodePinjam: string, idBuku: string) => {
  try {
    const docRef = await addDoc(collection(db, 'detailPeminjaman'), {
      kodePinjam,
      idBuku,
    });
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getDetailPeminjamanByKodePinjam = async (kodePinjam: string) => {
  try {
    const q = query(collection(db, 'detailPeminjaman'), where('kodePinjam', '==', kodePinjam));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const removeDetailPeminjaman = async (detailId: string) => {
  try {
    await deleteDoc(doc(db, 'detailPeminjaman', detailId));
  } catch (error: any) {
    throw new Error(error.message);
  }
};
