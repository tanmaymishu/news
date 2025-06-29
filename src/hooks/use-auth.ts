import {useContext} from "react";
// import {useRouter} from "next/navigation";
import {AuthContext} from "@/contexts/auth-context";

const useAuth = () => {
  const {isLoggedIn, user} = useContext(AuthContext);
  // const router = useRouter();
  //
  // if (!user) {
  //   router.push('/login')
  // }

  return {isLoggedIn, user};
};

export default useAuth;
