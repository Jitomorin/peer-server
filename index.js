require('dotenv').config()

const { ExpressPeerServer } = require('peer')
const express = require('express')
const cors = require('cors')
const http = require('http')

const app = express()
const server = http.createServer(function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('Hello world!')
})

const PORT = process.env.PORT || 9000

app.use(express.static('public'))

const peerServer = ExpressPeerServer(server, {
  debug: true,
  allow_discovery: true,
})

app.use('/myapp', peerServer)

// In-memory store for searching users
const searchingUsers = []

// Route to add a user to search mode
app.get('/start-search/:id', (req, res) => {
  const { id } = req.params
  if (!searchingUsers.includes(id)) {
    searchingUsers.push(id)
  }
  res.json({ success: true })
})

// Route to remove a user from search mode
app.get('/stop-search/:id', (req, res) => {
  const { id } = req.params
  const index = searchingUsers.indexOf(id)
  if (index > -1) {
    searchingUsers.splice(index, 1)
  }
  res.json({ success: true })
})

// Route to find a match for a user in search mode
app.get('/find-match/:id', (req, res) => {
  const { id } = req.params
  const otherUser = searchingUsers.find(userId => userId !== id)

  if (otherUser) {
    // If a match is found, remove both users from the search list
    searchingUsers.splice(searchingUsers.indexOf(otherUser), 1)
    searchingUsers.splice(searchingUsers.indexOf(id), 1)
    res.json({ match: otherUser })
  } else {
    res.json({ match: null })
  }
})

server.listen(PORT, () => {
  console.log(`PeerJS server running on port ${PORT}`)
})
