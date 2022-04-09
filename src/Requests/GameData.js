import axios from "axios";

export const GAME_DATA_URL = "https://statsapi.mlb.com/api/v1/schedule?sportId=1"

export const getLiveGameData = (gamePk) => {
  return 'https://statsapi.mlb.com/api/v1.1/game/' + gamePk + '/feed/live'
}

export const MLB_AVERAGE = 78