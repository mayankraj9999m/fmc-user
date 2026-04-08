// src/context/AlertContext.jsx
import { createContext, useContext } from "react";
import { AlertCircle, CheckCircle, Info, X, HelpCircle } from "lucide-react";

export const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);