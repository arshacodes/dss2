import { api, setAuthToken } from "@/config/axiosConfig";

export const registerUser = async (data) => {
    //send request to backend
    try {
        const response = await api.post("/register", data, {
            headers: {
                'Accept': 'application/json',
            }
        });
        console.log(response.data);
        // return response.data;
        // const { token, user } = response.data;
        // localStorage.setItem('token', token);
        // localStorage.setItem('user', JSON.stringify(user));

        return response.user;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export const loginUser = async (data) => {
    //send request to backend
    try {
        const response = await api.post("/login", data, {
            headers: {
                'Accept': 'application/json',
            }
        });
        // Set the auth token for future requests
        // setAuthToken(response.data.token);

        const { token, data: user, account_type } = response.data;

        // if (!token || !user) {
        //     throw new Error("Invalid login response");
        // }

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        // localStorage.setItem('account_type', account_type);

        console.log(response.data);
        return { user, account_type };
    } catch (error) {
        // console.error(response.data);
        console.error("Login error:", error);
        throw error;
    }
}