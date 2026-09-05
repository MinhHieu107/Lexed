import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:8080"
});

// Tự thêm Access Token vào mọi request
axiosInstance.interceptors.request.use(

    (config) => {

        const token = localStorage.getItem("accessToken");

        if (token) {

            config.headers.Authorization = `Bearer ${token}`;

        }

        return config;

    },

    (error) => Promise.reject(error)

);
axiosInstance.interceptors.response.use(

    (response) => response,

    async (error) => {

        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry
        ) {

            originalRequest._retry = true;

            try {

                const refreshToken =
                    localStorage.getItem("refreshToken");

                const response = await axios.post(
                    "http://localhost:8080/auth/refresh",
                    {
                        refreshToken
                    }
                );

                const newAccessToken =
                    response.data.accessToken;

                localStorage.setItem(
                    "accessToken",
                    newAccessToken
                );

                originalRequest.headers.Authorization =
                    `Bearer ${newAccessToken}`;

                return axiosInstance(originalRequest);

            } catch (err) {

                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");

                window.location.href = "/login";

                return Promise.reject(err);

            }

        }

        return Promise.reject(error);

    }

);
export default axiosInstance;