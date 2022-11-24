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
import { getSdkError } from "@walletconnect/utils";
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
  const [pairings, setPairings] = useState([]);

  const onSessionConnected = useCallback(async (_session) => {
    const allNamespaceAccounts = Object.values(_session.namespaces)
      .map((namespace) => namespace.accounts)
      .flat();
    setSession(_session);
    setAccounts(allNamespaceAccounts);
  }, []);

  const reset = () => {
    setSession(undefined);
    setAccounts([]);
  };

  const connect = useCallback(
    async (pairing) => {
      if (typeof client === "undefined") {
        throw new Error("WalletConnect is not initialized");
      }

      try {
        const requiredNamespaces = {
          eip155: {
            methods: ["eth_sendTransaction"],
            chains: ["eip155:5"],
            events: [],
          },
        };

        const { uri, approval } = await client.connect({
          pairingTopic: pairing?.topic,
          requiredNamespaces,
        });

        if (uri) {
          ModalCtrl.open({ uri, standaloneChains: ["eip155:5"] });
        }

        const session = await approval();
        await onSessionConnected(session);
        setPairings(client.pairing.getAll({ active: true }));
      } catch (e) {
        console.error(e);
      } finally {
        ModalCtrl.close();
      }
    },
    [client, onSessionConnected]
  );

  const disconnect = useCallback(async () => {
    if (typeof client === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }
    if (typeof session === "undefined") {
      throw new Error("Session is not connected");
    }
    await client.disconnect({
      topic: session.topic,
      reason: getSdkError("USER_DISCONNECTED"),
    });
    reset();
  }, [client, session]);

  const _subscribeToEvents = useCallback(
    async(_client) => {
      if (typeof _client === "undefined") {
        throw new Error("WalletConnect is not initialized");
      }

      _client.on("session_delete", () => {
        console.log("EVENT", "session_delete");
        reset();
      });

    }, [onSessionConnected]
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
      await _subscribeToEvents(_client);
    } catch (err) {
      throw err;
    }
  }, [_subscribeToEvents]);

  useEffect(() => {
    if (!client) {
      createClient();
    }
  }, [client, createClient]);

  const value = useMemo(
    () => ({
      client,
      connect,
      accounts,
      session,
      disconnect
    }),
    [client, connect, accounts, session, disconnect]
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
