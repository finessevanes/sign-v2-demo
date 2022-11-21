import {
  createContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  useContext,
} from "react";
import SignClient from "@walletconnect/sign-client";
import { ConfigCtrl, ModalCtrl } from "@web3modal/core";
import "@web3modal/ui";

export const ClientContext = createContext();

ConfigCtrl.setConfig({
  projectId: process.env.REACT_APP_PROJECT_ID,
  theme: "light",
});

export function ClientContextProvider({ children }) {
  const [client, setClient] = useState();
  const [session, setSession] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const connect = useCallback(
    async (pairing) => {
      if (typeof client === "undefined") {
        throw new Error("WalletConnect is not initialized");
      }

      try {
        const requiredNamespaces = {
          eip155: {
            methods: [
              "eth_sendTransaction",
            ],
            chains: ["eip155:5"],
            events: [],
          },
        };

        const { uri, approval } = await client.connect({
          pairingTopic: pairing?.topic,
          requiredNamespaces,
        });

        if (uri) {
          ModalCtrl.open({ uri, standaloneChains: ['eip155:5'] });
        }

        const session = await approval();
      } catch (e) {
        console.error(e);
      } finally {
        ModalCtrl.close();
      }
    },
    [client]
  );

  const createClient = useCallback(async () => {
    try {
      const _client = await SignClient.init({
        projectId: process.env.REACT_APP_PROJECT_ID,
        metadata: {
          name: "Example Dapp",
          description: "Example Dapp",
          url: "wwww.walletconnect.com",
          icons: ["https://walletconnect.com/walletconnect-logo.png"],
        },
      });
      setClient(_client);
    } catch (err) {
      throw err;
    }
  }, []);

  useEffect(() => {
    if (!client) {
      createClient();
    }
  }, [client, createClient]);

  const value = useMemo(
    () => ({
      client, connect, accounts, session
    }),
    [ client, connect, accounts, session ]
  );

  return (
    <ClientContext.Provider value={{ ...value }}>
      {children}
      <w3m-modal></w3m-modal>
    </ClientContext.Provider>
  );
}

export function useWalletConnectClient() {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error(
      "useWalletConnectClient must be used within a ClientContextProvider"
    );
  }
  return context;
}
