const $ = (id) => document.getElementById(id)

document.addEventListener('DOMContentLoaded', () => {
  const user = $('username')
  const rank = $('rank')
  const level = $('level')
  const leaderboardDiv = $('leaderboard')

  const serverId = '461483989463597057'
  const username = 'lupcii'

  chrome.runtime.sendMessage(
    { action: 'getUserData', serverId, username },
    (response) => {
      if (response && response.data) {
        const { username, level: level_, rank: rank_ } = response.data
        user.innerHTML = username

        if (!rank_) {
          rank.parentElement.remove()
        } else {
          rank.innerHTML = rank_
        }

        if (!level_) {
          level.parentElement.remove()
        } else {
          level.innerHTML = level_
        }
      } else {
        leaderboardDiv.innerHTML = 'Something went wrong.'
      }
    }
  )
})
