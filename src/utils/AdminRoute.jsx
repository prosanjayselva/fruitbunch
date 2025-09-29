import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig"; // adjust path

const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ track loading state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setIsAdmin(false);
        localStorage.setItem("isAdmin", JSON.stringify(false));
        setLoading(false);
        return;
      }

      // ✅ Check if user is in admins collection
      const adminRef = doc(db, "admins", currentUser.uid);
      const adminSnap = await getDoc(adminRef);

      const isAdminUser = adminSnap.exists();
      setIsAdmin(isAdminUser);
      localStorage.setItem("isAdmin", JSON.stringify(isAdminUser));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return isAdmin ? children : <Navigate to="/" replace />;
};

export default AdminRoute;