const GAME_STATE = {
	FirstCardAwaits: 'FirstCardAwaits',
	SecondCardAwaits: 'SecondCardAwaits',
	CardsMatchFailed: 'CardsMatchFailed',
	CardsMatched: 'CardsMatched',
	GameFinished: 'GameFinished',
}

const Symbols = [
	'./images/spade.svg', // 黑桃
	'./images/heart.svg', // 愛心
	'./images/club.svg', // 梅花
	'./images/diamond.svg', // 方塊
]

const utility = {
	getRandomNumberArray(count) {
		const number = Array.from(Array(count).keys())
		for (let index = number.length - 1; index > 0; index--) {
			let randomIndex = Math.floor(Math.random() * (index + 1))
			;[number[index], number[randomIndex]] = [
				number[randomIndex],
				number[index],
			]
		}
		return number
	},
}
// VIEW
const view = {
	getCardElement(index) {
		return `<div class="card back" data-index="${index}"></div>`
	},

	getCardContent(index) {
		const number = this.transformNumber((index % 13) + 1)
		const symbol = Symbols[Math.floor(index / 13)]
		return `
			<p style="color:${
				Math.floor(index / 13) % 2 === 0 ? 'black' : 'red'
			}">${number}</p>
			<img src="${symbol}" alt="">
			<p style="color:${
				Math.floor(index / 13) % 2 === 0 ? 'black' : 'red'
			}">${number}</p>`
	},

	transformNumber(number) {
		switch (number) {
			case 1:
				return 'A'
			case 11:
				return 'J'
			case 12:
				return 'Q'
			case 13:
				return 'K'
			default:
				return number
		}
	},

	displayCards(indexes) {
		const rootElement = document.querySelector('#cards')
		rootElement.innerHTML = indexes
			.map((index) => this.getCardElement(index))
			.join('')
	},

	flipCards(...cards) {
		cards.map((card) => {
			if (card.classList.contains('back')) {
				card.classList.remove('back')
				card.innerHTML = this.getCardContent(Number(card.dataset.index))
				return
			}
			card.classList.add('back')
			card.innerHTML = null
		})
	},
	pairCards(...cards) {
		cards.map((card) => {
			card.classList.add('paired')
		})
	},
	renderScore(score) {
		document.querySelector('.score').innerText = `Score: ${score}`
	},
	renderTriedTimes(times) {
		document.querySelector('.tried').innerText = `You've tried ${times} times.`
	},
	appendWrongAnimation(...cards) {
		cards.map((card) => {
			card.classList.add('wrong')
			card.addEventListener(
				'animationend',
				(event) => event.target.classList.remove('wrong'),
				{ once: true }
			)
		})
	},
	showGameFinished() {
		const div = document.createElement('div')
		div.classList.add('completed')
		div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.times} times</p>
    `
		const header = document.querySelector('#header')
		header.before(div)
	},
}
// MODEL
const model = {
	revealedCards: [],
	isRevealedCardsMatched() {
		return (
			this.revealedCards[0].dataset.index % 13 ===
			this.revealedCards[1].dataset.index % 13
		)
	},
	score: 0,
	times: 0,
}
// CONTROLLER
const controller = {
	currentState: GAME_STATE.FirstCardAwaits,
	generateCards() {
		view.displayCards(utility.getRandomNumberArray(52))
	},
	dispatchCardAction(card) {
		if (!card.classList.contains('back')) {
			return
		}
		switch (this.currentState) {
			case GAME_STATE.FirstCardAwaits:
				view.flipCards(card)
				model.revealedCards.push(card)
				this.currentState = GAME_STATE.SecondCardAwaits
				break
			case GAME_STATE.SecondCardAwaits:
				view.renderTriedTimes(++model.times)
				view.flipCards(card)
				model.revealedCards.push(card)
				if (model.isRevealedCardsMatched()) {
					view.renderScore((model.score += 10))
					this.currentState = GAME_STATE.CardsMatched
					view.pairCards(...model.revealedCards)
					model.revealedCards = []
					if (model.score === 260) {
						console.log('showGameFinished')
						this.currentState = GAME_STATE.GameFinished
						view.showGameFinished()
						return
					}
					this.currentState = GAME_STATE.FirstCardAwaits
				} else {
					view.appendWrongAnimation(...model.revealedCards)
					this.currentState = GAME_STATE.CardsMatchFailed
					setTimeout(this.resetCards, 1000)
				}
				break
		}
		console.log('this.currentState', this.currentState)
		console.log(
			'revealedCards',
			model.revealedCards.map((card) => card.dataset.index)
		)
	},
	resetCards() {
		view.flipCards(...model.revealedCards)
		model.revealedCards = []
		controller.currentState = GAME_STATE.FirstCardAwaits
	},
}

controller.generateCards()
document.querySelectorAll('.card').forEach((card) => {
	card.addEventListener('click', (event) => {
		controller.dispatchCardAction(card)
	})
})
