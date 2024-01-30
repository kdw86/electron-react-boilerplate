import { createContext, useContext, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";

export interface ThemeContextInterface {
  theme: string;
  primaryColor: string;
  changeTheme: (data:any) => void;
  changePrimaryColor: (data:any) => void;
}

export const themeContextDefaults: ThemeContextInterface = {
  theme: 'default',
  primaryColor: '#1677ff',
  changeTheme: () => null,
  changePrimaryColor: () => null
};

const ThemeContext = createContext<ThemeContextInterface>(themeContextDefaults);

export const ThemeProvider = ({ children }:any) => {
  const [theme, setTheme] = useLocalStorage("theme", "default");
  const [primaryColor, setPrimaryColor] = useLocalStorage("primaryColor", "#1677ff");

  const changeTheme = (data:string) => {
    setTheme(data);
  };

  const changePrimaryColor = (data:string) => {
    setPrimaryColor(data);
  };

  const value:ThemeContextInterface = useMemo(
    () => ({
      theme,
      primaryColor,
      changeTheme,
      changePrimaryColor
    }),
    [theme, primaryColor]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  return useContext(ThemeContext);
};
