const $ = (id) => document.getElementById(id)

function saveData(data) {
  chrome.storage.local.set(data, null)
}

function loadData(callback) {
  chrome.storage.local.get(null, function (items) {
    callback(items)
  })
}

document.addEventListener('DOMContentLoaded', () => {
  return
  loadData((data) => {
    if (data.username) {
      form.classList.add('hidden')

      const user = $('username')
      const rank = $('rank')
      const level = $('level')
      const leaderboardDiv = $('leaderboard')

      const serverId = '461483989463597057'

      const username = data.username
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

          leaderboardDiv.classList.remove('hidden')
        }
      )
    }
  })
})

document.addEventListener('submit', (e) => {
  e.preventDefault()
  const form = e.target
  const username = form.elements.username.value

  const user = $('username')
  const rank = $('rank')
  const level = $('level')
  const leaderboardDiv = $('leaderboard')
  const formDiv = $('form')
  const server_name = $('title')

  const serverId = '461483989463597057'

  chrome.runtime.sendMessage(
    { action: 'getUserData', serverId, username },
    (response) => {
      if (response && response.data) {
        const {
          username,
          level: level_,
          rank: rank_,
          server_name: server_name_,
        } = response.data

        user.innerHTML = username
        server_name.innerHTML = server_name_

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

      leaderboardDiv.classList.remove('hidden')
      formDiv.classList.add('hidden')

      saveData({ username })
    }
  )
})

$('change-username').addEventListener('click', () => {
  const form = $('form')
  const username = $('form-username')
  const leaderboardDiv = $('leaderboard')
  const server_name = $('title')

  server_name.innerHTML = 'Server'
  username.value = ''
  form.classList.remove('hidden')
  leaderboardDiv.classList.add('hidden')
})
