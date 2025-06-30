import {useContext} from "react";
import {AuthContext} from "@/contexts/auth-context";

const useAuth = () => {
  const {isLoggedIn, user} = useContext(AuthContext);

  return {isLoggedIn, user};
};

export default useAuth;
