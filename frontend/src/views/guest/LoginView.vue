<script setup>
import { onMounted, ref } from 'vue';

import { useRouter } from 'vue-router';
const router = useRouter();

import { loginUser } from '../../services/auth.js';

import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

const email = ref('');
const password = ref('');

const handleLogin = async () => {

    try {
        const response = await loginUser({
            email: email.value,
            password: password.value,
        });

        const account_type = response.account_type;

        toast("Login successful!", {
            autoClose: 3000,
            position: "bottom-left",
            type: "success",
        });

        if (account_type == 'buyer') {
            router.push('/auth/shop');
            console.log('Redirecting to /shop');
        } else if (account_type == 'seller'){
            router.push('/auth/sell');
            console.log('Redirecting to /sell');
        } 

        console.log('Login response:', response);
    } catch (error) {
        let message = "Login failed.";

        toast(message, {
        autoClose: 4000,
        position: "bottom-left",
        type: "error",
        });

    }   
}
</script>

<template>
    <div class="bg-gray-900/60 rounded-lg justify-center items-center w-1/2 md:w-1/4 mx-auto mt-20 shadow-lg">
        <div class="w-full p-10 text-white justify-content-center items-center ">
            <h1 class="font-bold mb-6 text-center text-xl">Welcome back!</h1>
            <form @submit.prevent="handleLogin" class="w-full flex flex-col space-y-2">
                <div class="form-group space-y-1 flex flex-col w-full">
                    <label for="email" class="text-sm">Email</label>
                    <input v-model="email" type="email" id="email" class="w-full py-1 px-2 rounded-lg text-white border-2 border-purple-500/60 text-xs" required>
                </div>
                <div class="form-group space-y-1 flex flex-col w-full mb-8">
                    <label for="password" class="text-sm">Password</label>
                    <input v-model="password" type="password" id="password" class="w-full py-1 px-2 rounded-lg text-white border-2 border-purple-500/60 text-xs" required>
                </div>
                <button type="submit" class="bg-purple-500 text-white rounded-lg p-2 shadow-lg">Login</button>
                <p class="text-xs text-center"><router-link to="/register" class="text-white link">No account yet? Register here.</router-link></p>

            </form>
        </div>
    </div>
</template>