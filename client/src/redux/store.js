import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import advertSlice from "./advertSlice";
import teamSlice from "./teamSlice";
export default configureStore({
    reducer: {
        user: userSlice,
        advert: advertSlice,
        team: teamSlice
    }
})