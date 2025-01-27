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
  const form_is_id = form.querySelector('#toggle-id').checked
  const form_server_id_or_name = form_is_id
    ? form.querySelector('#form-leaderboard-id').value
    : form.querySelector('#form-leaderboard-name').value

  const user = $('username')
  const rank = $('rank')
  const level = $('level')
  const leaderboardDiv = $('leaderboard')
  const formDiv = $('form')
  const server_title = $('title')
  const formError = $('form-error')

  // Validation
  if (form_is_id) {
    if (!form_server_id_or_name.match(/^\d+$/)) {
      formError.innerHTML = 'Server ID must be a number'
      return
    }
  } else {
    if (!form_server_id_or_name.match(/^[a-zA-Z0-9 ]+$/)) {
      formError.innerHTML = 'Server Name must be alphanumeric'
      return
    }
  }

  chrome.runtime.sendMessage(
    { action: 'getUserData', form_is_id, form_server_id_or_name, username },
    (response) => {
      if (response && response.data) {
        const {
          username,
          level: level_,
          rank: rank_,
          server_name,
        } = response.data

        user.innerHTML = username
        server_title.innerHTML = server_name

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
