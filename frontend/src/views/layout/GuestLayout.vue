<script setup>
import NavbarView from '../components/NavbarView.vue';

</script>

<template>
    <div class="bg-gradient min-h-screen">
        <NavbarView></NavbarView>
        <router-view></router-view>
        <!-- <div class="w-full h-full absolute top-0 left-0 bg-gray-900/90 opacity-30 z-n20">
        </div> -->
    </div>
</template>