import { useContext } from "react";
import { RouterContext } from "./RouterContext";

export const useParams = () => {
    return useContext(RouterContext);
};
