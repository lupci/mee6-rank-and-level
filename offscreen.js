function scrapeLeaderboard(url, username) {
  return new Promise((resolve) => {
    const config = { attributes: true, childList: true, subtree: true }
    const callback = (mutations, observer) => {
      let foundUser = null

      for (const mutation of mutations) {
        if (mutation.type !== 'childList') continue

        mutation.addedNodes.forEach((node) => {
          if (node.textContent?.includes(username)) {
            observer.disconnect()

            const bunch_of_grids = document.querySelectorAll(
              'div.grid.grid-cols-1'
            )
            if (!bunch_of_grids) return

            let list_of_users
            for (const grid of bunch_of_grids) {
              if (grid.children.length > 50) {
                list_of_users = grid
                break
              }
            }
            if (!list_of_users) return

            let user_div

            for (const div of list_of_users.children) {
              const inner_ps = div.querySelectorAll('p')
              for (const p of inner_ps) {
                if (
                  p.innerText.includes(username) &&
                  div.classList.contains('hidden')
                ) {
                  user_div = div
                  break
                }
              }
            }
            if (!user_div) return

            const level = user_div.querySelectorAll('div')[10].innerText
            const rank = user_div.querySelectorAll('div')[2].innerText
            foundUser = { username, level, rank }
          }
        })
      }

      if (foundUser) {
        resolve(foundUser)
      }
    }

    fetch(url)
      .then((response) => response.text())
      .then((html) => {
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')

        const observer = new MutationObserver(callback)
        observer.observe(doc, config)

        setTimeout(() => {
          observer.disconnect()
          resolve({ username: 'Timeout' })
        }, 6900)
      })
      .catch((error) => {
        resolve({ username: 'Fetching Error' })
      })
  })
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getRank') {
    const { url, username } = message

    scrapeLeaderboard(url, username).then((results) => {
      sendResponse({ data: results || null })
    })
  }

  return true
})
