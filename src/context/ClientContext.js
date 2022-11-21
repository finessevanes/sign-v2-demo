import {
  createContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  useContext,
} from "react";
import SignClient from "@walletconnect/sign-client";
import { ConfigCtrl } from "@web3modal/core";
import "@web3modal/ui";

export const ClientContext = createContext();

ConfigCtrl.setConfig({
  projectId: process.env.REACT_APP_PROJECT_ID,
  theme: "light",
});

export function ClientContextProvider({ children }) {
  const [client, setClient] = useState();

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
      client,
    }),
    [client]
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
