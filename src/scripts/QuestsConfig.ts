import { CurrentGameData, Globals } from "./Globals";
import { LoaderConfig } from "./LoaderConfig";
import { checkIfClaimed, DIRECTION, Quest, Reward } from "./quest";

export const images = {
	package: require("../sprites/package.png"),
	packageHover: require("../sprites/package-hover.png"),
	ball0: require("../sprites/candy0.png"),
	ball1: require("../sprites/candy1.png"),
	ball2: require("../sprites/candy2.png"),
	ball3: require("../sprites/candy3.png"),
	ball4: require("../sprites/candy4.png"),
	ball5: require("../sprites/candy5.png"),
	ball6: require("../sprites/candy6.png"),
	ball7: require("../sprites/candy7.png"),
	ball8: require("../sprites/candy8.png"),



	Potion_Kick: require("../sprites/potion-kick.png"),
	Potion_Ball: require("../sprites/potion-ball.png"),
	Potion_Score: require("../sprites/potion-score.png"),
	potion_Biscuit: require("../sprites/potion-bisquit.png"),

	arrowLeft: require("../sprites/button-left.png"),
	arrowRight: require("../sprites/button-right.png"),
	helpFullBiscuit: require("../sprites/helpful-biscuit.png"),
	mascotMessage: require("../sprites/message.png"),
	biscuit: require("../sprites/golden-biscuit-small.png"),
};

export const Rewards: { [id: string]: Reward } = {
	Coins: new Reward(
		"Extra Coins",
		"Coins",
		"Gives Extra Coins",
		"This Gives You Extra 50 Coins",
		images.biscuit.default,

		() => {
			console.log("Toggle Powerup");
			Globals.emitter?.Call("GiveCoins", 50);
		},

	),

};

export const AllQuests = [
	new Quest(
		"scorePoints1",
		"Score Points",
		"Score 20 points",
		Rewards.Coins,
		1,
		false,
		() => {
			return CurrentGameData.lastScore >= 20;
		},
		() => {
			return true;
		},
		() => {
			const lastScore = Math.min(CurrentGameData.lastScore, 20);
			return [lastScore, 20];
		}
	),

	new Quest(
		"scorePoints2",
		"Score Points",
		"Score 300 points",
		Rewards.Coins,
		1,
		false,
		() => {
			return CurrentGameData.lastScore >= 300;
		},
		() => {
			return true
		},
		() => {
			const maxScore = Math.min(CurrentGameData.lastScore, 300);
			return [maxScore, 300];
		}
	),
	new Quest(
		"scorePoints3",
		"Score Points",
		"Score 500 points",
		Rewards.Coins,
		1,
		false,
		() => {
			return CurrentGameData.lastScore >= 500;
		},
		() => {
			return true;
		},
		() => {
			const lastScore = Math.min(CurrentGameData.lastScore, 500);
			return [lastScore, 500];
		}
	),
	new Quest(
		"scorePoints4",
		"Score Points",
		"Score 700 points",
		Rewards.Coins,
		1,
		false,
		() => {
			return CurrentGameData.lastScore >= 700;
		},
		() => {
			return checkIfClaimed("scorePoints1");
		},
		() => {
			const lastScore = Math.min(CurrentGameData.lastScore, 700);
			return [lastScore, 700];
		}
	),
	new Quest(
		"scorePoints4",
		"Score Points",
		"Score 1000 points",
		Rewards.Coins,
		1,
		false,
		() => {
			return CurrentGameData.lastScore >= 1000;
		},
		() => {
			return checkIfClaimed("scorePoints2");
		},
		() => {
			const lastScore = Math.min(CurrentGameData.lastScore, 1000);
			return [lastScore, 1000];
		}
	),
	new Quest(
		"scorePoints4",
		"Score Points",
		"Score 1500 points",
		Rewards.Coins,
		1,
		false,
		() => {
			return CurrentGameData.lastScore >= 1500;
		},
		() => {
			return checkIfClaimed("scorePoints3");
		},
		() => {
			const lastScore = Math.min(CurrentGameData.lastScore, 1500);
			return [lastScore, 1500];
		}
	),
];

export const ArrOfBalls = [
	{
		url: images.ball0.default,
		price: -1,
	},
	{
		url: images.ball1.default,
		price: 200,
	},
	{
		url: images.ball2.default,
		price: 300,
	},
	{
		url: images.ball3.default,
		price: 400,
	},
	{
		url: images.ball4.default,
		price: 500,
	},
	{
		url: images.ball5.default,
		price: 600,
	},
	{
		url: images.ball6.default,
		price: 700,
	},
	{
		url: images.ball7.default,
		price: 800,
	},
	{
		url: images.ball8.default,
		price: 900,
	},


];
