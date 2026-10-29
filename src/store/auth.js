import { create } from "zustand";

export const useGlobalState = create((set) => ({
  isConected: true,
  setIsConected: (isConected) => set({ isConected }),

  isRestoringConnection: false,
  setIsRestoringConnection: (isRestoringConnection) =>
    set({ isRestoringConnection }),

  versionAndroid: null,
  setVersionAndroid: (versionAndroid) => set({ versionAndroid }),

  versionIos: null,
  setVersionIos: (versionIos) => set({ versionIos }),

  globalNumber: null,
  setGlobalNumber: (globalNumber) => set({ globalNumber }),

  showTabBar: true,
  setShowTabBar: (showTabBar) => set({ showTabBar }),

  goScreen: null,
  setGoScreen: (goScreen) => set({ goScreen }),

  isAnonimo: false,
  setIsAnonimo: (isAnonimo) => set({ isAnonimo }),

  isLogin: false,
  setLogin: (isLogin) => set({ isLogin }),

  userMsisdn: null,
  setUserMsisdn: (userMsisdn) => set({ userMsisdn }),

  userData: null,
  setUserData: (userData) => set({ userData }),

  openpayId: null,
  setOpenpayId: (openpayId) => set({ openpayId }),

  imageUser: null,
  setImageUser: (imageUser) => set({ imageUser }),

  generateTicketGlobal: false,
  setGenerateTicketGlobal: (generateTicketGlobal) =>
    set({ generateTicketGlobal }),
}));

export default useGlobalState;
