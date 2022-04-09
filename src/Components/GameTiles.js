import axios from "axios";
import React, { useEffect, useState } from "react";
import { GAME_DATA_URL } from '../Requests/GameData';
import SingleGame from "./SingleGame";
import { Grid, Card } from '@mui/material'
import './ComponentStyles.css'

const GameTiles = () => {
  const [games, setGames] = useState({});
  const [date, setDate] = useState("04-08-2022")

  useEffect(() => {
    // const intervalId = setInterval(() => {
      const fetchGamesInfo = async () => {
        const gameData = await axios.get(GAME_DATA_URL);
        const gameDataLoad = gameData.data.dates.at(-1)
        console.log(gameDataLoad)
        setGames(gameDataLoad)
      }

      fetchGamesInfo().catch(() => {
        console.log("Error fetching games")
      })
    // },1000000);
    // return () => clearInterval(intervalId);
  },[])

  useEffect(() => {
    if (games) {
      setDate(games.date)
    }
  },[games])


  return (
    <Grid container spacing={2} className={"container"}>
      <Grid item xs={12}>
        <Card><h1>{(games && games.games) ? "Today's Games: " + date : "Loading..."}</h1></Card>
      </Grid>
      {games && games.games && games.games.map((game) => {
        return (
          <SingleGame key={game.gamePk} singleGame={game}/>
        )
      })}
    </Grid>
  )
}

export default GameTiles;