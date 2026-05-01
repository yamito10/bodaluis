import { useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useStore } from '../store/useStore';

export function useConfig() {
  const { meta, fechaViaje, pin, loadingMeta, setMeta, setFechaViaje, setPin, setLoadingMeta } = useStore();

  useEffect(() => {
    const docRef = doc(db, 'config', 'meta');
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setMeta(data.monto || 0);
          if (data.fechaViaje) setFechaViaje(data.fechaViaje);
          if (data.pin !== undefined) setPin(data.pin);
        } else {
          setMeta(0);
        }
      },
      (error) => {
        console.error("Error al leer config de Firestore:", error);
        setLoadingMeta(false);
      }
    );

    return () => unsubscribe();
  }, [setMeta, setFechaViaje, setPin, setLoadingMeta]);

  const updateMeta = async (monto: number) => {
    await setDoc(doc(db, 'config', 'meta'), { monto }, { merge: true });
  };

  const updateFechaViaje = async (fechaViaje: string) => {
    await setDoc(doc(db, 'config', 'meta'), { fechaViaje }, { merge: true });
  };

  const updatePin = async (pin: string | null) => {
    await setDoc(doc(db, 'config', 'meta'), { pin }, { merge: true });
  };

  return { meta, fechaViaje, pin, loading: loadingMeta, updateMeta, updateFechaViaje, updatePin };
}
