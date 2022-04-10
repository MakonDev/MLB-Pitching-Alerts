const one = 1

function gameSchedule () {
  const intervalId = setInterval(() => {
    console.log(one+1)
  },15000);
  return () => clearInterval(intervalId);
}