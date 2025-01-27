chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getUserData') {
    const { form_is_id, form_server_id_or_name, username } = message

    const server_name = !form_is_id
      ? form_server_id_or_name.toLowerCase().replace(' ', '')
      : form_server_id_or_name

    const leaderboardUrl = form_is_id
      ? `https://mee6.xyz/en/leaderboard/${server_name}`
      : `https://mee6.xyz/en/${server_name}`

    chrome.tabs.create({ url: leaderboardUrl, active: false }, (tab) => {
      chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
        if (tabId === tab.id && info.status === 'complete') {
          chrome.scripting.executeScript(
            {
              target: { tabId: tab.id },
              func: scrapeLeaderboard,
              args: [username],
            },
            (results) => {
              chrome.tabs.remove(tab.id)
              sendResponse({ data: results[0]?.result || null })
            }
          )
          chrome.tabs.onUpdated.removeListener(listener)
        }
      })
    }) /**/

    // Offscreen document
    /*setupOffscreenDocument('offscreen.html').then(() => {
      // Send message to offscreen document
      chrome.runtime.sendMessage(
        {
          action: 'getRank',
          url: leaderboardUrl,
          username,
        },
        (results) => {
          sendResponse({ data: results.data || null })
        }
      )
    })/**/

    return true
  }
})

function scrapeLeaderboard(username) {
  return new Promise((resolve) => {
    const config = { attributes: true, childList: true, subtree: true }
    const callback = (mutations, observer) => {
      let foundUser = null

      for (const mutation of mutations) {
        if (mutation.type !== 'childList') continue

        mutation.addedNodes.forEach((node) => {
          if (node.textContent?.includes(username)) {
            observer.disconnect()

            const server_name = document.querySelector(
              'h1.text-white.text-h3'
            ).textContent

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

            let rank = ''
            const next_img = user_div.querySelector('img')
            if (next_img.alt.includes('in the leaderboard')) {
              rank = next_img.alt[0]
            } else {
              rank = user_div.querySelector(
                'div.w-8.h-8.flex.items-center.justify-center'
              ).textContent
            }

            const level = user_div.querySelector('div.font-bold.text-white').innerText
            foundUser = { username, level, rank, server_name }
          }
        })
      }

      if (foundUser) {
        resolve(foundUser)
      }
    }

    const observer = new MutationObserver(callback)
    observer.observe(document.body, config)

    setTimeout(() => {
      observer.disconnect()
      resolve(null)
    }, 6900)
  })
}

// MARK: OFFSCREEN DOCUMENT

let creating // A global promise to avoid concurrency issues
async function setupOffscreenDocument(path) {
  // Check all windows controlled by the service worker to see if one
  // of them is the offscreen document with the given path
  const offscreenUrl = chrome.runtime.getURL(path)
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreenUrl],
  })

  if (existingContexts.length > 0) {
    return
  }

  // create offscreen document
  if (creating) {
    await creating
  } else {
    creating = chrome.offscreen.createDocument({
      url: path,
      reasons: ['DOM_PARSER', 'DOM_SCRAPING'],
      justification: 'get rank and level',
    })
    await creating
    creating = null
  }
}
