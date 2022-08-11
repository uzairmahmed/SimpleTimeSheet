import './App.css';
import { ChakraProvider } from '@chakra-ui/react'

import MainPage from './pages/MainPage'

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import firebaseConfig from './firebaseConfig';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


export default function App() {
  return (
    <ChakraProvider>
      <MainPage />
    </ChakraProvider>
  );
}
