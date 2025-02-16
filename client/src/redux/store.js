import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import advertSlice from "./advertSlice";
export default configureStore({
    reducer: {
        user: userSlice,
        advert: advertSlice
    }
})