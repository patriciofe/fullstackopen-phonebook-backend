require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')
const person = require('./models/person')

const app = express()
app.use(express.static('dist'))
app.use(express.json())

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
  Person.find({}).then(result => {
    res.json(result)
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) res.json(person)
      else res.status(404).end()
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  if (!body.name || !body.number)
    return res.status(400).json({
      error: 'name or number missing'
    })
  
  const person = new Person({
    name: body.name,
    number: body.number
  })
  
  person.save()
    .then(savedPerson => {
      res.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body
  
  Person.findById(req.params.id)
    .then(person => {
      if (!person) return res.status(404).end()
      
      person.name = name
      person.number = number

      return person.save().then((updatedPerson) => {
        res.json(updatedPerson)
      })
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  let errorMessage
  const thisError = (error.errors['name']
    || error.errors['number']).properties

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id'})
  } else if (error.name === 'ValidationError') {
    switch (thisError.type) {
      case 'minlength': 
        errorMessage = `${thisError.path} must be at least ${thisError.minlength} characters long.`
        break
      case 'user defined': {
        errorMessage = `${thisError.path} has an invalid format (Must be ###-###-####)`
        break
      }
    }
    return response.status(400).send({ error: errorMessage })
  }
  
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})