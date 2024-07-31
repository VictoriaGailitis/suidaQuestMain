let express = require(`express`)
let app = express()

let port = 3001
app.listen(port, ()=>{
    console.log(`http://localhost:${port}`)
})

app.use(express.static(`public`))
app.use(express.json())

const hbs = require(`hbs`)
app.set(`views`, `views`)
app.set('view engine','hbs')

app.use(express.urlencoded({ extended: true }))

function getNextScreen(data, currScreen) {
    const numOfScreens = data.screens.length
    if (currScreen + 1 > numOfScreens) {
        return -1;
    }
    else {
        return currScreen + 1;
    }
}

app.get(`/`, async function (req, res) {
    const response = await fetch(`http://localhost:3000/suidaQuestAPI/getAllQuests`);
    const data = await response.json();
    res.render(`index`,{
        quests: data 
    })
})

app.get(`/quest`, async function (req, res) {
    const response = await fetch(`http://localhost:3000/suidaQuestAPI/getOneQuest/${req.query.id}`);
    const data = await response.json();
    if (req.query.screen == -1) {
        res.redirect(`/completed?id=${req.query.id}`)
    }
    else {
        res.render(`walkthrough`,{
            screen: data.screens[Number(req.query.screen) - 1],
            currentScreen: Number(req.query.screen),
            questId: req.query.id
        })
    }
})

app.post(`/quest`, async function (req, res) {
    const response = await fetch(`http://localhost:3000/suidaQuestAPI/getOneQuest/${req.query.id}`);
    const data = await response.json();
    const currentScreen = data.screens[Number(req.query.screen) - 1]
    let correct = false
    if (currentScreen.correctAnswer && currentScreen.correctAnswer.toLowerCase() == req.body.userAnswer.toLowerCase()) {
        correct = true;
    }
    else if (req.body.checkedVariant == "true") {
        correct = true;
    }
    if (correct == true) {
        const nextScreen = getNextScreen(data, Number(req.query.screen))
        if (nextScreen == -1) {
            res.redirect(`/completed?id=${req.query.id}`)
        }
        else {
            res.redirect(`/quest?id=${req.query.id}&screen=${nextScreen}`)
        }
    }
    else {
        res.render(`walkthrough`,{
            screen: currentScreen,
            currentScreen: Number(req.query.screen),
            questId: req.query.id,
            error: "Неправильный ответ!"
        })
    }
})

app.get(`/completed`, async function (req, res) {
    const response = await fetch(`http://localhost:3000/suidaQuestAPI/getOneQuest/${req.query.id}`);
    const data = await response.json();
    res.render(`complete`,{
        quest: data
    })
})