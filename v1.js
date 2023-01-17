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
  res.send(`your IP address is ${clientIP}`)
})

router.get(`/room`, (req, res) => {
  res.send(Array.from(rooms.keys()))
})

router.put(`/room`, (req, res) => {
  if(clientIP===`unknown`){ res.send("Cannot recognize your IP. Room not created.") }
  const ID = getUniqueRoomID(ROOM_ID_LENGTH)
  res.send(`Created room ID ${ID}`)
})

function getUniqueRoomID(length){
  let uniqueRoomID
  do{
    uniqueRoomID = generateRoomID(length)
  } while(rooms.has(uniqueRoomID))
  rooms.set(uniqueRoomID, clientIP)
  return uniqueRoomID
}

function generateRoomID(length){
  if(length<=0) return ''
  return getRandomEntry(consonants) + generateRoomID(length-1)
}

function getRandomEntry(arr){
  return arr[Math.floor(Math.random() * (arr.length - 1))]
}

module.exports = router