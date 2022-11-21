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
      {accounts.length ? <h2>{`${accounts[0]}`}</h2> : ""}
    </div>
  );
}

export default App;
