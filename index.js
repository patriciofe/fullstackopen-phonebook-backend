const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('body', (req, res) => JSON.stringify(req.body))

app.use(morgan(
  ':method :url :status :res[content-length] - :response-time ms :body')
)

let persons = [
  { 
    "id": "1",
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": "2",
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": "3",
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": "4",
    "name": "Mary Poppendicycle", 
    "number": "39-23-6423122"
  }
]

app.get('/info', (req, res) => {
  const timestamp = new Date(Date.now())

  const pluralizedPersons = persons.length === 1
    ? 'person'
    : 'people'

  res.send(`
      <p>Phonebook has info for ${persons.length} ${pluralizedPersons}</p>
      <p>${timestamp.toString()}</p>
    `)
})

app.get('/api/persons', (req, res) => {
  res.send(persons)
})

app.get('/api/persons/:id', (req, res) => {
  const requestId = req.params.id

  const person = persons.find(person => person.id === requestId)
  console.log(person)

  if (person) res.send(person)
  else res.status(404).end()
})

app.delete('/api/persons/:id', (req, res) => {
  const requestId = req.params.id

  persons = persons.filter(p => p.id !== requestId)
  res.status(204).end()
})

app.post('/api/persons', (req, res) => {
  const newId = Math.floor(Math.random() * 1000000)
  const body = req.body

  const existingNames = persons.map(p => p.name)

  if (!body.name || !body.number)
    return res.status(400).json({
      error: 'name or number missing'
    })
  
  if (existingNames.includes(body.name))
    return res.status(400).json({
      error: 'name already exists'
    })
  
  const person = {
    id: String(newId),
    name: body.name,
    number: body.number
  }

  persons = persons.concat(person)

  res.json(person)

})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})