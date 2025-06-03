import { ChakraProvider, Box, Flex } from "@chakra-ui/react";
import { AuthProvider } from "./hooks/useAuth";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes/appRoutes";
import Footer from "./components/Footer";

function App() {
  return (
    <ChakraProvider>
      <AuthProvider>
        <Flex direction="column" minH="100vh">
          <Navbar />
          <Box flex="1">
            <AppRoutes />
          </Box>
          <Footer />
        </Flex>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
