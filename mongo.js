const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}
else if (process.argv.length === 4) {
  console.log('Name or number missing')
  process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://patriciofe:${password}@persons.dc8ocbv.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=Persons`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
  Person.find({}).then(result => {
    result.forEach(note => console.log(note))
    mongoose.connection.close()
    process.exit(0)  
  })
}
else if (process.argv.length === 4) {
  const newPersonName = process.argv[3]
  const newPersonNumber = process.argv[4]
  
  const person = new Person({
    name: newPersonName,
    number: newPersonNumber
  })
  
  person.save().then(result => {
    console.log(`Added ${person.name} (number ${person.number}) to phonebook!`)
    mongoose.connection.close()
  })
}