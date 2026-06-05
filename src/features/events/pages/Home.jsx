import { useEffect, useState } from "react";
import { supabase } from "../../../services/supabase";

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    }

    getUser();
  }, []);

  return (
    <div>
      <h1>RAVE Home</h1>

      {user ? (
        <h2>Welcome {user.email}</h2>
      ) : (
        <h2>Not Logged In</h2>
      )}
    </div>
  );
}