import { LoadQuestsData, SaveQuestsData } from "./DataHandler";
import { AllQuests } from "./QuestsConfig";

export class Quest {
	completed: boolean = false;
	claimed: boolean = false;

	constructor(
		public key: string,
		public name: string,
		public description: string,
		public reward: Reward,
		public rewardValue: number,
		public isUnlocked: boolean,
		public condition: () => boolean,
		public unlockCondition: () => boolean,
		public fetchCurrentProgressionLogic: () => number[]
	) { }

	get CurrentProgression() {
		return this.fetchCurrentProgressionLogic(); //should return [currentProgression, maxProgression]
	}

	checkUnlockCondition() {
		if (this.isUnlocked) return;

		if (this.unlockCondition && this.unlockCondition()) this.isUnlocked = true;

		SaveQuests();
	}

	checkCondition() {
		if (!this.isUnlocked) return false;

		if (this.completed) return true;

		// console.log("Check Condition");

		if (this.condition && this.condition()) {
			this.completed = true;
			SaveQuests();
			// this.onComplete();
			return true;
		}

		return false;
	}

	claim() {
		console.log("CLAIMED " + this.name);
		this.claimed = true;
		SaveQuests();
	}
}

export function RefereshAllQuests() {
	for (let i = 0; i < AllQuests.length; i++) {
		if (AllQuests[i].claimed) continue;

		AllQuests[i].checkUnlockCondition();
		AllQuests[i].checkCondition();
	}
}

export enum DIRECTION {
	RightToLeft,
	LeftToRight,
}

export class Reward {
	useCallback: (() => void) | undefined;

	constructor(
		public name: string,
		public id: string,
		public description: string,
		public mascotDescription: string,
		public rewardImgURL: string,
		useCallback: (() => void) | undefined = undefined,
		public collectEffectDirection: DIRECTION = DIRECTION.RightToLeft
	) {
		this.useCallback = useCallback;
	}

	use() {
		if (this.useCallback) {
			this.useCallback();
		}
	}
}

const quests: { [index: string]: Quest } = {};

export function SaveQuests() {
	SaveQuestsData(quests);
}

export function getQuest(key: string): Quest {
	return quests[key];
}

export function checkIfQuestCompleted(key: string) {
	const quest = getQuest(key);

	if (quest) return quest.completed;
	else {
		console.log("Quest not found if quest completed");
		return false;
	}
}

export function checkIfClaimed(key: string) {
	const quest = getQuest(key);

	if (quest) return quest.claimed;
	else {
		console.log("Quest not found if claimed");
		return false;
	}
}

export function addQuest(quest: Quest) {
	if (!quests[quest.key]) {
		console.log("Adding Quest");
		quests[quest.key] = quest;
		// SaveQuests();
	}
	else console.log("Quest already exists");
}

export function allQuests() {
	return quests;
}

export function getUnlockedQuests() {
	const unlockedQuests = [];
	for (const quest in quests) {
		console.log(quest, quests[quest],"getunlockedquset");
		if (quests[quest].isUnlocked && !quests[quest].claimed) unlockedQuests.push(quests[quest]);
	}
	return unlockedQuests;
}

export function getCompletedQuests() {
	const completedQuests = [];
	for (const quest in quests) {
		if (quests[quest].completed) completedQuests.push(quest);
	}
	return completedQuests;
}

export function getClaimedQuests() {
	const claimedQuests = [];
	for (const quest in quests) {
		if (quests[quest].claimed) claimedQuests.push(quest);
	}
	return claimedQuests;
}

// addQuest(new Quest("quest2", "Quest 2", "This is a quest2", "reward", "./package.png", true,() => {
//         return false;
//     }, () => {
//         console.log("completed");
//     },
//     undefined,
//     () => {
//         return [1, 1];
//     }));

// addQuest(new Quest("quest3", "Quest 3", "This is a quest3", "reward", "./package.png", false, () => {
//         return false;
//     }, () => {
//         console.log("completed");
//     },
//     undefined,
//     () => {
//         return [1, 2];
//     }));

// addQuest(new Quest("quest4", "Quest 4", "This is a quest4", "reward", "./package.png", true,() => {
//         return false;
//     }, () => {
//         console.log("completed");
//     },
//     undefined,
//     () => {
//         return [0, 10];
//     }));
