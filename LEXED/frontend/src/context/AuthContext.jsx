import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser } from "../services/userService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const fetchUser = async () => {

            const token = localStorage.getItem("accessToken");

            if (!token) {
                setLoading(false);
                return;
            }

            try {

                const currentUser = await getCurrentUser();

                setUser(currentUser);

            }
            catch (err) {

                console.log(err.response?.data);

                localStorage.clear();

                window.location.replace("/login");

            }

            setLoading(false);

        };

        fetchUser();

    }, []);

    return (

        <AuthContext.Provider
            value={{
                user,
                setUser,
                loading
            }}
        >

            {children}

        </AuthContext.Provider>

    );

};

export const useAuth = () => useContext(AuthContext);