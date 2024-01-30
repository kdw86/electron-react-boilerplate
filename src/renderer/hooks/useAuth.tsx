import { createContext, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "./useLocalStorage";
import axios from 'axios';
import { message } from 'antd';

export interface AuthContextInterface {
  user: any | null;
  login: (data:any) => void;
  logout: () => void;
}

export const authContextDefaults: AuthContextInterface = {
  user: null,
  login: () => null,
  logout: () => null
};

const AuthContext = createContext<AuthContextInterface>(authContextDefaults);

export const AuthProvider = ({ children }:any) => {
  const [user, setUser] = useLocalStorage("user", null);
  const navigate = useNavigate();
  const instance = axios.create({ baseURL: `http://${process.env.REACT_APP_API_URL}` });

  const login = async (data:any) => {
    console.log('login : ', data)
    instance
      .post('/api/v1/auth/authenticate', data)
      .then((res) => {
        console.log('login res : ', res.data.authority);
        setUser(res.data);
        switch (data.type) {
          case 'stt':
            navigate("/main/stt", { replace: true });
            break;
          case 'subeditor':
            if(res.data.user.authority.includes('projectOwner')){
              navigate("/main/projectOwner", { replace: true });
            }else if(res.data.user.authority.includes('transcriptor')){
              navigate("/main/transcriptor", { replace: true });
            }else if(res.data.user.authority.includes('transcriteInspector')){
              navigate("/main/transcriteInspector", { replace: true });
            }else if(res.data.user.authority.includes('translator')){
              navigate("/main/translator", { replace: true });
            }else if(res.data.user.authority.includes('translateInspector')){
              navigate("/main/translateInspector", { replace: true });
            }
            break;
          case 'admin':
            if(res.data.user.authority.includes('admin')){
              navigate("/main/admin", { replace: true });
            }else{
              message.error("ADMIN 계정이 아닙니다.");
              navigate("/", { replace: true });
            }
            break;
          default:
            navigate("/", { replace: true });
        }
      })
      .catch((error) => {
        console.log(error);
        message.error("로그인 에러, 관리자에게 문의하세요");
      });
  };

  const login2 = async (data:any) => {
    console.log('login2 : ', data)
    setUser(data);
    if(data.user.role==="GUEST"){
      navigate("/main/stt", { replace: true });
    }else if(data.user.authority.includes('admin')){
      navigate("/main/admin", { replace: true });
    }else if(data.user.authority.includes('projectOwner')){
      navigate("/main/projectOwner", { replace: true });
    }else if(data.user.authority.includes('transcriptor')){
      navigate("/main/transcriptor", { replace: true });
    }else if(data.user.authority.includes('transcriteInspector')){
      navigate("/main/transcriteInspector", { replace: true });
    }else if(data.user.authority.includes('translator')){
      navigate("/main/translator", { replace: true });
    }else if(data.user.authority.includes('translateInspector')){
      navigate("/main/translateInspector", { replace: true });
    }else{
      navigate("/", { replace: true });
    }
  };

  const logout = () => {
    setUser(null);
    navigate("/", { replace: true });
  };

  const value:AuthContextInterface = useMemo(
    () => ({
      user,
      login,
      logout
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
