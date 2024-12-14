import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { AuthProvider } from "./hooks/useAuth";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes/appRoutes";

function App() {
  return (
    <ChakraProvider>
      <AuthProvider>
        <Navbar />
        <AppRoutes />
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
