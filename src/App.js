import { useState } from "react";
import "./App.css";
import { useWalletConnectClient } from "./context/ClientContext";

function App() {
  const { connect, client, accounts, session, disconnect } = useWalletConnectClient();
  const [txnUrl, setTxnUrl] = useState();

  const onConnect = () => {
    try {
      if (client) {
        connect();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const onDisconnect = () => {
    disconnect();
  };

  async function onSend() {
    try {
      if (client) {
        const account = accounts[0];
        if (account === undefined) throw new Error(`Account not found`);

        const tx = {
          from: "0xEc57410F1F15df337b54c66BD98F1702B407cB22",
          to: "0xBDE1EAE59cE082505bB73fedBa56252b1b9C60Ce",
          data: "0x",
          gasPrice: "0x029104e28c",
          gasLimit: "0x5208",
          value: "0x00",
        };

        const result = await client.request({
          topic: session.topic,
          chainId: "eip155:5",
          request: {
            method: "eth_sendTransaction",
            params: [tx],
          },
        });

        setTxnUrl(result);

        return {
          method: "eth_sendTransaction",
          address: "0xEc57410F1F15df337b54c66BD98F1702B407cB22",
          valid: true,
          result,
        };
      }
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div className="App">
      <h1>Sign v2</h1>
      {accounts.length ? (
        <>
          <h2>{`${accounts[0]}`}</h2>
          <button onClick={onSend}>send_Transaction</button>
          <button onClick={onDisconnect}>Disconnect</button>
          {txnUrl && (
            <h2>
              Check it out{" "}
              <a
                href={`https://goerli.etherscan.io/tx/${txnUrl}`}
                target="_blank"
                rel="noreferrer"
              >
                here
              </a>
            </h2>
          )}
        </>
      ) : (
        <button onClick={onConnect} disabled={!client}>
          Connect
        </button>
      )}
    </div>
  );
}

export default App;
