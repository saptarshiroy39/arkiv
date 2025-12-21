// Configuration - Core Settings
// 1. React hooks, API URL, and global Supabase reference


const { useState, useRef, useEffect, useContext, createContext } = React;

// API URL (relative for production)
const API_URL = '';

// Global supabase client reference
let supabase;
