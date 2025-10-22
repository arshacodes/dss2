<script setup>
import { onMounted, ref } from 'vue';

import { registerUser } from '../../services/auth.js';

import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

import { useRouter } from 'vue-router';
const router = useRouter();

const name = ref('');
const email = ref('');
const accountType = ref('');
const password = ref('');
const confirmPassword = ref('');

const handleRegister = async () => {
    console.log('Registering user:', {
        name: name.value,
        email: email.value,
        accountType: accountType.value,
        password: password.value,
        confirmPassword: confirmPassword.value
    });
    try {
        const response = await registerUser({
            name: name.value,
            email: email.value,
            account_type: accountType.value,
            password: password.value,
            password_confirmation: confirmPassword.value
        });

        toast("Registration successful! Redirecting to login...", {
            autoClose: 3000,
            position: "bottom-left",
            type: "success",
        });

        setTimeout(() => {
            router.push('/login');
        }, 3000);

        // router.push('/login');
    } catch (error) {
        let message = "Registration failed.";

        toast(error, {
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
            <h1 class="font-bold mb-6 text-center text-xl">Create Account</h1>
            <form @submit.prevent="handleRegister" class="w-full flex flex-col space-y-2">
                <div class="form-group space-y-1 flex flex-col w-full">
                    <label for="name" class="text-sm">Name</label>
                    <input v-model="name" type="text" id="name" class="w-full py-1 px-2 rounded-lg text-white border-2 border-purple-500/60 text-xs" required>
                </div>
                <div class="form-group space-y-1 flex flex-col w-full">
                    <label for="email" class="text-sm">Email</label>
                    <input v-model="email" type="email" id="email" class="w-full py-1 px-2 rounded-lg text-white border-2 border-purple-500/60 text-xs" required>
                </div>
                <div class="form-group space-y-2 flex flex-col w-full">
                    <label for="accountType" class="text-sm font-medium">Account Type</label>
                    
                    <div class="flex items-center">
                        <input v-model="accountType" type="radio" name="account-type" id="buyer" value="buyer" class="accent-pink-500 mr-2 bg-white/50" required>
                        <label for="buyer" class="text-sm mr-4">Buyer</label>
                    </div>
                    
                    <div class="flex items-center">
                        <input v-model="accountType" type="radio" name="account-type" id="seller" value="seller" class="accent-pink-500 mr-2 bg-white/50" required>
                        <label for="seller" class="text-sm mr-4">Seller</label>
                    </div>
                </div>
                <div class="form-group space-y-1 flex flex-col w-full">
                    <label for="password" class="text-sm">Password</label>
                    <input v-model="password" type="password" id="password" class="w-full py-1 px-2 rounded-lg text-white border-2 border-purple-500/60 text-xs" required>
                </div>
                <div class="form-group space-y-1 flex flex-col w-full mb-8">
                    <label for="confirm-password" class="text-sm">Confirm Password</label>
                    <input v-model="confirmPassword" type="password" id="confirm-password" class="w-full py-1 px-2 rounded-lg text-white border-2 border-purple-500/60 text-xs" required>
                </div>
                <button type="submit" class="bg-purple-500 text-white rounded-lg p-2 shadow-lg">Register</button>
                <p class="text-xs text-center"><router-link to="/login" class="text-white link">Already have an account? Login here.</router-link></p>

            </form>
        </div>
    </div>
</template>