export const GAME_DATA_URL = "https://statsapi.mlb.com/api/v1/schedule?sportId=1"

export const buildTodaysGamesUrl = (date) => {
  return "https://statsapi.mlb.com/api/v1/schedule?sportId=1&startDate="+date+"&endDate="+date
}

export const getLiveGameData = (gamePk) => {
  if (gamePk) {
    return 'https://statsapi.mlb.com/api/v1.1/game/' + gamePk + '/feed/live'
  }
  return ''
}

export const getSpecificPlayerGameStats = (playerId) => {
  return "https://statsapi.mlb.com/api/v1/people?personIds="+playerId+"&season=2022&hydrate=stats(type=gameLog,season=2022,gameType=R)"
}

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

export const getInningPitchCountLevels = (pitchesThisInning) => {
  if (pitchesThisInning) {
    if (pitchesThisInning < 14) {
      return 'Low'
    }
    if (pitchesThisInning <= 20) {
      return 'Watch'
    }
    else {
      return 'High'
    }
  } else {
    return 'Calculating...'
  }
}

export const getTwitterLevels = (twitterPitcherInfo) => {
  if (twitterPitcherInfo && twitterPitcherInfo.averageTweets && twitterPitcherInfo.recentHourTweets) {
    if (twitterPitcherInfo.recentHourTweets <= twitterPitcherInfo.averageTweets) {
      return 'Low'
    }
    if (twitterPitcherInfo.recentHourTweets < twitterPitcherInfo.averageTweets*3) {
      return 'Watch'
    }
    else {
      return 'High'
    }
  } else {
    return 'Calculating ...'
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
    if (level === 'Low') {
      return 'lowAlert'
    }
    else {
      return 'noAlert'
    }
  } else {
    return 'noAlert'
  }
}