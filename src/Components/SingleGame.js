import axios from "axios";
import React, { useEffect, useState } from "react";
import { getLiveGameData, getPitchCountLevels, getSpecificPlayerGameStats, getWarningLevels, getInningPitchCountLevels, getTwitterLevels } from "../Requests/GameData";
import { Grid, Card, CardContent, Collapse, CardActions } from '@mui/material'
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import IconButton from '@mui/material/IconButton';
import "./ComponentStyles.css"

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  //transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const SingleGame = (singleGame) => {
  const game = singleGame.singleGame
  const homeTeamName = (game && game.teams && game.teams.home) ? game.teams.home.team.name : 'Home'
  const awayTeamName = (game && game.teams && game.teams.away) ? game.teams.away.team.name : 'Away'
  const gameStatus = (game && game.status) ? game.status.detailedState : 'Pending'
  const gameLive = (game && game.status && gameStatus === 'In Progress') ? true : false
  const homeScore = (game && game.teams && game.teams.home) ? game.teams.home.score : -1
  const awayScore = (game && game.teams && game.teams.away) ? game.teams.away.score : -1
  const homeWin = (game && game.teams && game.teams.home) ? game.teams.home.isWinner : null
  const awayWin = (game && game.teams && game.teams.away) ? game.teams.away.isWinner : null
  const [expanded, setExpanded] = useState(
    (gameStatus === 'Final' || gameStatus === 'Pending' || gameStatus === 'Postponed' || gameStatus === 'Scheduled') 
    ? false 
    : true
  );
  const [gameInfoLive, setGameInfoLive] = useState({})
  const [pitcherLineStats, setPitcherLineStats] = useState([])
  const gameDate = (gameInfoLive && gameInfoLive.gameData && gameInfoLive.gameData.datetime) ? gameInfoLive.gameData.datetime.officialDate : '2022-04-08'
  const currentBatter = (gameInfoLive && gameInfoLive.liveData && gameInfoLive.liveData.linescore && gameInfoLive.liveData.linescore.offense
    && gameInfoLive.liveData.linescore.offense.batter) ? gameInfoLive.liveData.linescore.offense.batter.fullName : ''
  const linescore = (gameInfoLive && gameInfoLive.liveData) ? gameInfoLive.liveData.linescore : {}
  const currentPitcher = (linescore && linescore.defense && linescore.defense.pitcher) ? linescore.defense.pitcher.fullName : 'Not yet'
  const currentPitcherId = (linescore && linescore.defense && linescore.defense.pitcher) ? linescore.defense.pitcher.id : null
  const probableHomePitcher = (gameInfoLive && gameInfoLive.gameData && gameInfoLive.gameData.probablePitchers && gameInfoLive.gameData.probablePitchers.home) ? gameInfoLive.gameData.probablePitchers.home.fullName : 'No Probable Home Pitcher'
  const probableAwayPitcher = (gameInfoLive && gameInfoLive.gameData && gameInfoLive.gameData.probablePitchers && gameInfoLive.gameData.probablePitchers.away) ? gameInfoLive.gameData.probablePitchers.away.fullName : 'No Probable Away Pitcher'
  const currentPitcherTeam = (linescore && linescore.defense && linescore.defense.team) ? linescore.defense.team.name : 'No team'

  const getTotalPitches = (pitcher) => {
    if (gameInfoLive && gameInfoLive.liveData && pitcher) {
      let pitches =[]
      for (var x = 0; x < gameInfoLive.liveData.boxscore.info.length; x++) {
        const info = gameInfoLive.liveData.boxscore.info[x]
        if (info.label === 'Pitches-strikes') {
          const lastName = pitcher.split(" ").at(-1)
          const pitchersSplits = info.value.split(";")
          for (var i = 0; i < pitchersSplits.length; i++) {
            if (pitchersSplits[i].includes(lastName)) {
              let split = pitchersSplits[i].replace(".","")
              const values = split.split(" ")
              pitches = values.at(-1).split("-")
              break;
            }
          }
          break;
        }
      }
      return pitches
    }
  }

  const pitches = getTotalPitches(currentPitcher ? currentPitcher : null)
  const pitchCountLevel = getPitchCountLevels(pitches ? pitches[0] : null)
  const warningLevel = getWarningLevels(pitchCountLevel ? pitchCountLevel : null)
  const [inningPitches, setInningPitches] = useState(0)
  const pitchesThisInning = (pitches && inningPitches) ? pitches[0]-inningPitches : 0
  const inningPitchLevel = getInningPitchCountLevels(pitchesThisInning)
  const inningWarningLevel = getWarningLevels(inningPitchLevel ? inningPitchLevel : null)
  const [twitterPitcherInfo, setTwitterPlayerInfo] = useState({})
  const tweetCountLevel = getTwitterLevels(twitterPitcherInfo)
  const tweetWarningLevel = getWarningLevels(tweetCountLevel ? tweetCountLevel : null)

  useEffect(() => { //set initial inning pitches
      if (pitches && pitches.length !== 0) {
        setInningPitches(pitches[0])
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },[currentPitcher])

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  useEffect(() => {
    if (game && game.gamePk) {
      const fetchGameInfo = async () => {
        const LIVE_GAME_URL = getLiveGameData(game.gamePk)
        const gameData = await axios.get(LIVE_GAME_URL);
        //console.log(gameData.data)
        setGameInfoLive(gameData.data)
      }

      fetchGameInfo().catch(() => {
        console.log("Error fetching live game data")
      })
    }
  },[game, game.gamePk])

  useEffect(() => {
    if (game && game.gamePk && currentPitcherId) {
      const fetchPlayerStats = async () => {
        const STATS_URL = getSpecificPlayerGameStats(currentPitcherId)
        const playerStats = await axios.get(STATS_URL)
        const person = playerStats.data.people[0]
        if (person.stats) {
          const currentGame = person.stats[0].splits.at(-1)
          if (currentGame.date === gameDate) {
            const data = [currentGame.stat.baseOnBalls, currentGame.stat.strikeOuts, currentGame.stat.hits]
            setPitcherLineStats(data)
          }
        }
      }

      fetchPlayerStats().catch((e) => {
        console.log("Error fetching live game data", e)
      })
    }
  },[game, game.pk, currentPitcherId, gameDate])


  useEffect(() => {
    const intervalId = setInterval(() => {
      if (currentPitcher && gameDate && currentPitcher !== 'Not Yet' && gameDate !== '2022-04-08' && gameStatus && gameStatus === 'In Progress' && currentPitcherTeam && currentPitcherTeam !== 'No team') {
        const backend = async () => {
          const pitcherLastName = currentPitcher.split(" ")
          const response = await axios.get(
            "https://mlbp-itching-twitter-engine.vercel.app/api/twitterCounts?date="+gameDate+"&name="+pitcherLastName[1]+"&team="+currentPitcherTeam
          )
          console.log(response.data.data)
          setTwitterPlayerInfo(response.data.data)
        }
        backend().catch(() => {
          console.log("backend error")
        })
      }
    },10000);
    return () => clearInterval(intervalId);
  })

  return (
    <Grid item xs={6} >
      <Card variant="outlined">
      <CardContent className={"gameNotBeingPlayed"}>
        {(homeScore!==-1 && awayScore!==-1) ?
        <h2>
          {homeTeamName}: {homeScore} {homeWin && <span>(W)</span>} vs. {awayTeamName}: {awayScore} {awayWin && <span>(W)</span>}
        </h2> :
        <h2>
          {homeTeamName} {homeWin && <span>(W)</span>} vs. {awayTeamName} {awayWin && <span>(W)</span>}
        </h2>
        }
        {gameLive 
          ? <h3>Situation: {linescore.inningHalf} {linescore.currentInning}, {linescore.balls}-{linescore.strikes} Count {linescore.outs} Outs, {currentBatter} hitting.</h3> 
          : <h3>Status: {gameStatus}</h3>
        }
      </CardContent>
      <CardActions>
      <ExpandMore
          expand={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <span>Ongoing games will display pitching data below</span>
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
        {gameStatus === 'In Progress' 
          ? 
            <>
              <h2>Current Pitcher: {currentPitcher}</h2>
              {(pitches && pitches.length !== 0 && pitcherLineStats.length !== 0) &&
                <>
                  <h2>Stats</h2>
                  <h3>Total Pitches: {pitches[0]} Strikes: {pitches[1]} Pitches this Inning: {pitchesThisInning}</h3>
                  <h3>Walks: {pitcherLineStats[0]} Ks: {pitcherLineStats[1]} Hits: {pitcherLineStats[2]}</h3>
                </>
              }
              {
                twitterPitcherInfo &&
                <h3>Potential Bullpen Tweets: {twitterPitcherInfo.recentHourTweets} vs {twitterPitcherInfo.averageTweets ? twitterPitcherInfo.averageTweets.toFixed(2) : twitterPitcherInfo.averageTweets} tweets/hr</h3>
            
              }

            </>
          : <h2>Matchup: {probableHomePitcher} vs {probableAwayPitcher}</h2>
        }
        </CardContent>
        <CardContent>
        {gameStatus === 'In Progress' 
          ? 
          <>
            <h2>Alerts</h2>
            <h3 className={warningLevel}>Pitch Count: {pitchCountLevel}</h3>
            <h3 className={inningWarningLevel}>Pitches this Inning: {inningPitchLevel}</h3>
            {twitterPitcherInfo && 
              <h3 className={tweetWarningLevel}>Flagged Tweets: {tweetCountLevel}</h3>
            }
          </>
          : <h3>No Alerts Available</h3>
        }
        </CardContent>
      </Collapse>
      </Card>
    </Grid>
  )
}

export default SingleGame