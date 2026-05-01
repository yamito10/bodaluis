import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, Timestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBYWF0gfVsEVyO6JvbMz7QcMRFn_Mybfug",
  authDomain: "studio-4039228395-7a153.firebaseapp.com",
  projectId: "studio-4039228395-7a153",
  storageBucket: "studio-4039228395-7a153.firebasestorage.app",
  messagingSenderId: "88482599325",
  appId: "1:88482599325:web:92040b833365e779185f74"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const newPayments = [
  { monto: 1000, fecha: "2025-08-29", codigoAutorizacion: "NU38M9USO67S8D1Q48O1EQIFREVN" },
  { monto: 300, fecha: "2026-01-14", codigoAutorizacion: "NU39DOLLQQ839POPOAFEJALACDC6" },
  { monto: 200, fecha: "2026-02-02", codigoAutorizacion: null },
  { monto: 200, fecha: "2026-02-15", codigoAutorizacion: "3843CP06202602154983723636" },
  { monto: 500, fecha: "2026-02-28", codigoAutorizacion: "38432P04202602285032869482" },
  { monto: 600, fecha: "2026-03-30", codigoAutorizacion: "3843CP02202603305138610371" },
  { monto: 400, fecha: "2026-04-30", codigoAutorizacion: "3843CP04202604305250198792" }
];

async function seed() {
  console.log("Borrando pagos anteriores...");
  const snapshot = await getDocs(collection(db, 'pagos'));
  for (const doc of snapshot.docs) {
    await deleteDoc(doc.ref);
  }
  console.log("Pagos anteriores borrados.");

  console.log("Inyectando nuevos pagos...");
  for (let i = 0; i < newPayments.length; i++) {
    const p = newPayments[i];
    // Create an artificial timestamp so they appear in order
    // We add 'i' seconds so they have slightly different creation times
    const date = new Date(p.fecha + "T12:00:00Z");
    date.setSeconds(date.getSeconds() + i);
    
    await addDoc(collection(db, 'pagos'), {
      ...p,
      creadoEn: Timestamp.fromDate(date)
    });
    console.log(`Pago de $${p.monto} inyectado.`);
  }
  console.log("¡Listo!");
  process.exit(0);
}

seed().catch(console.error);
