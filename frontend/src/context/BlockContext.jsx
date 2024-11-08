import { createContext } from 'react';

export const BlockContext = createContext({
  account: null,
  setAccount: () => {},
  accountType: null,
  setAccountType: () => {},
});