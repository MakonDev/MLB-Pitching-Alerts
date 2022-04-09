import axios from "axios";

export const GAME_DATA_URL = "https://statsapi.mlb.com/api/v1/schedule?sportId=1"

export const getLiveGameData = (gamePk) => {
  return 'https://statsapi.mlb.com/api/v1.1/game/' + gamePk + '/feed/live'
}

export const MLB_AVERAGE = 78

export const getPitchCountLevels = (pitchCount) => {
  if (pitchCount) {
    if (pitchCount < 40) {
      return 'Low'
    }
    if (pitchCount <= 78) {
      return 'Watch'
    }
    else {
      return 'High'
    }
  } else {
    return 'Calculating...'
  }
}

export const getWarningLevels = (level) => {
  if (level) {
    if (level === 'High') {
      return 'highAlert'
    }
    if (level === 'Watch') {
      return 'watchAlert'
    }
    else {
      return 'lowAlert'
    }
  } else {
    return 'lowAlert'
  }
}