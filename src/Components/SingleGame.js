import axios from "axios";
import React, { useEffect, useState } from "react";
import { getLiveGameData, getPitchCountLevels, getWarningLevels } from "../Requests/GameData";
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
  //console.log(game.teams)
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
  const currentBatter = (gameInfoLive && gameInfoLive.liveData && gameInfoLive.liveData.linescore && gameInfoLive.liveData.linescore.offense
    && gameInfoLive.liveData.linescore.offense.batter) ? gameInfoLive.liveData.linescore.offense.batter.fullName : ''
  const linescore = (gameInfoLive && gameInfoLive.liveData) ? gameInfoLive.liveData.linescore : {}
  const currentPitcher = (linescore && linescore.defense && linescore.defense.pitcher) ? linescore.defense.pitcher.fullName : 'Not yet'
  const probableHomePitcher = (gameInfoLive && gameInfoLive.gameData && gameInfoLive.gameData.probablePitchers && gameInfoLive.gameData.probablePitchers.home) ? gameInfoLive.gameData.probablePitchers.home.fullName : 'No Probable Home Pitcher'
  const probableAwayPitcher = (gameInfoLive && gameInfoLive.gameData && gameInfoLive.gameData.probablePitchers && gameInfoLive.gameData.probablePitchers.away) ? gameInfoLive.gameData.probablePitchers.away.fullName : 'No Probable Away Pitcher'

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

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  useEffect(() => {
    if (game && game.gamePk) {
      const fetchGameInfo = async () => {
        const LIVE_GAME_URL = getLiveGameData(game.gamePk)
        const gameData = await axios.get(LIVE_GAME_URL);
        setGameInfoLive(gameData.data)
        
      }

      fetchGameInfo().catch(() => {
        console.log("Error fetching live game data")
      })
    }
  },[game, game.gamePk])

  return (
    <Grid item xs={6} >
      <Card variant="outlined">
      <CardContent className={"gameNotBeingPlayed"}>
        {(homeScore && awayScore) ?
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
              {(pitches && pitches.length !== 0) &&
                <h3>Total Pitches: {pitches[0]} Strikes: {pitches[1]}</h3>
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