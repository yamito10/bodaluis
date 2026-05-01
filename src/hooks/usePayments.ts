import { useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Payment } from '../types/payment';
import { useStore } from '../store/useStore';

export function usePayments() {
  const { payments, loadingPayments, setPayments, setLoadingPayments } = useStore();

  useEffect(() => {
    const q = query(collection(db, 'pagos'), orderBy('creadoEn', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          creadoEn: doc.data().creadoEn?.toDate() || new Date()
        })) as Payment[];
        setPayments(data);
      },
      (error) => {
        console.error("Error al leer pagos de Firestore:", error);
        setLoadingPayments(false);
      }
    );

    return () => unsubscribe();
  }, [setPayments, setLoadingPayments]);

  const addPayment = async (monto: number, fecha: string, codigoAutorizacion?: string | null, notas?: string | null) => {
    await addDoc(collection(db, 'pagos'), {
      monto,
      fecha,
      codigoAutorizacion: codigoAutorizacion || null,
      notas: notas || null,
      creadoEn: Timestamp.now()
    });
  };

  const updatePayment = async (id: string, monto: number, fecha: string, codigoAutorizacion?: string | null, notas?: string | null) => {
    await updateDoc(doc(db, 'pagos', id), {
      monto,
      fecha,
      codigoAutorizacion: codigoAutorizacion || null,
      notas: notas || null,
    });
  };

  const deletePayment = async (id: string) => {
    await deleteDoc(doc(db, 'pagos', id));
  };

  return { payments, loading: loadingPayments, addPayment, updatePayment, deletePayment };
}
