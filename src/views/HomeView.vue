<template>
  <Header />
  <HomeComponent />
</template>

<script setup>
import Header from '@/components/Header.vue';
import HomeComponent from '../components/HomeComponent.vue'
const API_URL = import.meta.env.VITE_API_URL
</script>