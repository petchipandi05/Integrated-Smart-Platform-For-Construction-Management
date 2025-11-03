import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { URL } from "../../../url";

const RegistrationContext = createContext();

export const RegistrationProvider = ({ children }) => {
  const [unviewedCount, setUnviewedCount] = useState(0);

  useEffect(() => {
    const fetchUnviewedCount = async () => {
      try {
        const response = await axios.get(URL+"/api/requestform/registrations");
        const fetchedProjects = response.data;
        const count = fetchedProjects.filter((project) => !project.verified).length;
        setUnviewedCount(count);
      } catch (err) {
        console.error("Error fetching registrations:", err);
      }
    };

    fetchUnviewedCount();
  }, []);

  return (
    <RegistrationContext.Provider value={{ unviewedCount, setUnviewedCount }}>
      {children}
    </RegistrationContext.Provider>
  );
};

export const useRegistrationContext = () => useContext(RegistrationContext);
