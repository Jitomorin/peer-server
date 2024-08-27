require('dotenv').config()
const { ExpressPeerServer } = require('peer')
const express = require('express')
const cors = require('cors')
const http = require('http')

const app = express()
const server = http.createServer(app)

const PORT = process.env.PORT || 9000

app.use(express.static('public'))
app.use(cors())
app.use(express.json())

const peerServer = ExpressPeerServer(server, {
  debug: true,
  allow_discovery: true,
})

app.use('/myapp', peerServer)

let searchingPeers = [] // Store peers currently in search mode

// Route to add a peer to search mode
app.post('/search', (req, res) => {
  const { id } = req.body
  if (!id) return res.status(400).send('ID is required')

  // Check if there's a match
  const matchIndex = searchingPeers.findIndex(peer => peer.id !== id)
  if (matchIndex > -1) {
    const match = searchingPeers[matchIndex]
    searchingPeers.splice(matchIndex, 1) // Remove matched peer from the list

    // Notify both peers of the match
    res.json({ matchedId: match.id })
    // You might use WebSockets or other means to notify the matched peer
  } else {
    // No match found, add to searching list
    searchingPeers.push({ id })
    res.json({ matchedId: null })
  }
})

// Route to remove a peer from search mode
app.post('/stop-search', (req, res) => {
  const { id } = req.body
  if (!id) return res.status(400).send('ID is required')

  searchingPeers = searchingPeers.filter(peer => peer.id !== id)
  res.send('Search mode stopped')
})

server.listen(PORT, () => {
  console.log(`PeerJS server running on port ${PORT}`)
})
