import { createSlice } from "@reduxjs/toolkit";

const advertSlice = createSlice({
  name: "advert",
  initialState: {
    adverts: [],
    myadverts: [],
  },
  reducers: {
    fetchAdverts: (state, action) => {
      console.log("Gelen veriler:", action.payload.allAdverts);
      console.log("Kullanıcı ID:", action.payload.userId);

      state.adverts = action.payload.allAdverts;

      state.myadverts = action.payload.allAdverts.filter(
        (advert) => advert.owner && advert.owner._id === action.payload.userId
      );

      console.log("Filtrelenmiş myadverts:", state.myadverts);
    },
  },
});

export const { fetchAdverts } = advertSlice.actions;
export default advertSlice.reducer;
