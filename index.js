const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const path = require('path')
const app = express()
const PORT = 3001

let persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
]

const generateId = (persons) => {
  const maxId = persons.length > 0 ? Math.max(...persons.map((p) => p.id)) : 0
  return maxId + 1
}

const existingName = (persons, name) => {
  return persons.some((p) => p.name === name)
}

const morganFormat = (tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'),
    '-',
    tokens['response-time'](req, res),
    'ms',
    JSON.stringify(req.body),
  ].join(' ')
}

app.use(express.json())
app.use(morgan(morganFormat))
app.use(cors())
app.use(express.static(path.join(__dirname, 'dist')))

app.get('/info', (req, res) => {
  const count = persons.length
  const date = new Date()
  res.send(`<p>Phonebook has info for ${count} people</p><p>${date}</p>`)
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
  try {
    const id = Number(req.params.id)

    if (isNaN(id)) {
      return res
        .status(400)
        .json({ error: 'Invalid ID format (must be a number)' })
    }

    const person = persons.find((p) => p.id === id)
    if (!person) {
      return res.status(404).json({ error: 'Person not found' })
    }

    res.json(person)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/persons', (req, res) => {
  const body = req.body

  if (!body.number || !body.name) {
    return res.status(400).json({
      error: 'number or name missing',
    })
  }

  if (existingName(persons, body.name)) {
    return res.status(400).json({
      error: `name must be unique`,
    })
  }

  const person = {
    id: generateId(persons),
    name: body.name,
    number: body.number,
  }

  persons = persons.concat(person)
  res.json(person)
})

app.put('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find((p) => p.id === id)
  const body = req.body

  const changePerson = { ...person, number: body.number }

  persons = persons.map((p) => (p.id === id ? changePerson : p))

  res.json(changePerson)
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find((p) => p.id === id)

  if (!person) {
    return res.status(404).end()
  }

  persons = persons.filter((p) => p.id !== id)
  res.status(204).end()
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknownEndpoint' })
}

app.use(unknownEndpoint)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
