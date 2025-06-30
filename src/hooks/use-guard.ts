import {useContext} from "react";
import {AuthContext} from "@/contexts/auth-context";
import { redirect } from "next/navigation";

const useGuard = () => {
  const {isLoggedIn} = useContext(AuthContext);
  if (!isLoggedIn) {
    redirect('/login');
  }
};

export default useGuard;
