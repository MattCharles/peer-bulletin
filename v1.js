const express = require('express')
const router = express.Router()

const consonants = Array.from(`bcdfghjklmnpqrstvwyxz`)
const ROOM_ID_LENGTH = 5
let clientIP
let rooms = new Map()

// middleware that is specific to this router
router.use((req, res, next) => {
  clientIP = req.header('x-forwarded-for') ||  			
            req.socket.remoteAddress || `unknown_ip`;
  console.log(`Request from ${clientIP} at time of ${Date.now()}`)
  next()
})
// define the home page route
router.get('/', (req, res) => {
  res.send(`Welcome to the bulletin board! Your IP address is ${clientIP}`)
})

router.get(`/room`, (req, res) => {
  res.send(Array.from(rooms.keys()))
})

router.put(`/room`, (req, res) => {
  if(clientIP===`unknown`){ res.send("Cannot recognize your IP. Room not created.") }
  const ID = createUniqueRoom(ROOM_ID_LENGTH)
  res.send(`Created room ID ${ID}`)
})

router.delete('/room/:roomID', (req, res) => {
  const requestedID = req.params.roomID
  if(!rooms.has(requestedID)){
    res.send(`Room ${requestedID} not found.`)
  }
  if(!clientIsHost(rooms.get(requestedID))){
    res.send(`Only host can delete room ${requestedID}`)
  }
  rooms.delete(requestedID)
  res.send(`${requestedID} deleted.`)
})

router.get('/room/:roomID', (req, res) => {
  const requestedID = req.params.roomID
  if(!rooms.has(requestedID)){
    res.send(`Room ${requestedID} not found.`)
  }
  res.send(rooms.get(requestedID))
})

router.put('/room/:roomID', (req, res) => {
  const requestedID = req.params.roomID
  if(!rooms.has(requestedID)){
    res.send(`Room ${requestedID} not found.`)
  }
  requestedRoom = rooms.get(requestedID)
  if(clientInRoom(requestedRoom)){
    res.send(`You're already in the room ${requestedID}`)
  }
  requestedRoom.push({IP: clientIP, host: false})
  res.send(`Successfully joined ${requestedID}`)
})

function createUniqueRoom(idLength){
  let uniqueRoomID
  do{
    uniqueRoomID = generateRoomID(idLength)
  } while(rooms.has(uniqueRoomID))
  rooms.set(uniqueRoomID, [{IP: clientIP, host: true}])
  return uniqueRoomID
}

function generateRoomID(length){
  if(length<=0) return ''
  return getRandomEntry(consonants) + generateRoomID(length-1)
}

function getRandomEntry(arr){
  return arr[Math.floor(Math.random() * (arr.length - 1))]
}

function clientInRoom(room){
  return room.reduce((prev, curr) => prev || (curr.IP === clientIP), false)
}

function clientIsHost(room){
  return room.reduce((prev, curr) => prev || (curr.IP === clientIP && curr.host == true), false)
}

module.exports = router