import { createSlice } from "@reduxjs/toolkit";

const advertSlice = createSlice({
    name: "advert",
    initialState: {
        adverts: []
    },
    reducers: {
        fetchAdverts: (state, action) => {
            state.adverts = action.payload;
        }
    }
})



export const { fetchAdverts } = advertSlice.actions
export default advertSlice.reducer