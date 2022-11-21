import "./App.css";
import { useWalletConnectClient } from "./context/ClientContext";

function App() {
  const { connect, client, accounts, session } = useWalletConnectClient();

  const onConnect = () => {
    try {
      if (client) {
        connect();
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="App">
      <h1>Sign v2</h1>
      <button onClick={onConnect} disabled={!client}>Connect</button>
    </div>
  );
}

export default App;
