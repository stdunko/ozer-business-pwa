import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import executorReducer from "./executorSlice";
import liveReducer from "./liveSlice";

export const store = configureStore({
  reducer: {
    authorization: authReducer,
    executor: executorReducer,
    live: liveReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
