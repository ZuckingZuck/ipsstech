import { createSlice } from "@reduxjs/toolkit";

const teamSlice = createSlice({
    name: "team",
    initialState: {
        myteams: [],
        myleds: []
    },
    reducers: {
        fetchTeams: (state, action) => {
            state.myteams = action.payload;
        },
        fetchLeds: (state, action) => {
            state.myleds = action.payload;
        }
    }
})



export const { fetchTeams, fetchLeds } = teamSlice.actions
export default teamSlice.reducer