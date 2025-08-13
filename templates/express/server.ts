// imports
import express from "express"
import cors from "cors"

const app = express()
const PORT = 5000

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
  res.send(`Welcome to ${'{{projectName}}'}`);
})

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))