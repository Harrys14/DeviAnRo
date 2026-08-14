import { useUser } from "@clerk/clerk-react";
import AppRouter from "./routes/AppRouter";

function App() {
  const { isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div
        style={{
          padding: "100px",
          fontSize: "28px",
          textAlign: "center",
        }}
      >
        Cargando...
      </div>
    );
  }

  return <AppRouter />;
}

export default App;