const fs = require('fs');
const path = 'src/Constructor.vue';
let code = fs.readFileSync(path, 'utf8');

// Remove sidebarView 'banners' tab
const sidebarTabRegex = /<button class="smenu-nav-item" @click="openSidebarView\('banners'\)">[\s\S]*?<\/button>/;
code = code.replace(sidebarTabRegex, '');

const sidebarContentRegex = /<!-- БАННЕРЫ С АКЦИЯМИ -->[\s\S]*?<template v-else-if="sidebarView === 'banners'">[\s\S]*?<\/template>/;
code = code.replace(sidebarContentRegex, '');

// remove 'banners' from sidebar type
const sidebarTypeRegex = /type SidebarView = 'main' \| 'orders' \| 'staff' \| 'payment' \| 'profile' \| 'filters' \| 'trash' \| 'banners';/;
code = code.replace(sidebarTypeRegex, "type SidebarView = 'main' | 'orders' | 'staff' | 'payment' | 'profile' | 'filters' | 'trash';");

fs.writeFileSync(path, code);
console.log('Cleaned up sidebarView');

